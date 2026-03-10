using System.ComponentModel.DataAnnotations.Schema;
using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

/// <summary>
/// Representa um contrato de prestação de serviços de segurança patrimonial entre a empresa e um cliente.
/// </summary>
public class Contrato : Entity, IAggregateRoot
{
    /// <summary>
    /// Identificador do cliente associado a este contrato.
    /// </summary>
    public Guid ClienteId { get; private set; }
    
    /// <summary>
    /// Descrição do contrato (ex: "Contrato de Portaria 12x36", "Vigilância Diurna").
    /// </summary>
    public string Descricao { get; private set; } = null!;
    
    /// <summary>
    /// Valor total mensal que o cliente pagará (faturamento bruto).
    /// Inclui: salários, benefícios, impostos, margens de lucro e cobertura de faltas.
    /// </summary>
    public decimal ValorTotalMensal { get; private set; }
    
    /// <summary>
    /// Valor da diária cobrada por funcionário (base de cálculo para 30 dias).
    /// Usado para cálculo do custo mensal: ValorDiaria × Funcionários × 30 dias.
    /// </summary>
    public decimal ValorDiariaCobrada { get; private set; }
    
    /// <summary>
    /// Valor padrão da diária pago ao vigilante neste contrato.
    /// Usado como fallback quando não há tags específicas (FASE 3).
    /// </summary>
    public decimal? ValorDiariaVigilante { get; private set; }
    
    /// <summary>
    /// Percentual de adicional noturno (conforme CLT Art. 73 - mínimo 20%).
    /// Aplicado quando o funcionário trabalha em posto com horário entre 22h e 5h.
    /// Exemplo: 0.20 = 20% sobre o salário base.
    /// </summary>
    public decimal PercentualAdicionalNoturno { get; private set; }
    
    /// <summary>
    /// Valor total mensal de benefícios extras (vale-transporte, alimentação, etc.).
    /// Será dividido igualmente entre todos os funcionários do contrato.
    /// </summary>
    public decimal ValorBeneficiosExtrasMensal { get; private set; }
    
    /// <summary>
    /// Percentual de impostos incidentes sobre o valor total (INSS, FGTS, etc.).
    /// Exemplo: 0.15 = 15% do valor total mensal.
    /// </summary>
    public decimal PercentualImpostos { get; private set; }
    
    /// <summary>
    /// Número de turnos/postos de trabalho no cliente.
    /// - 2 postos = Escala 12x36 (diurno 6h-18h + noturno 18h-6h)
    /// - 3 postos = Escala 8h (manhã, tarde, noite)
    /// - 4 postos = Escala 6h (4 turnos por dia)
    /// </summary>
    public int NumeroDePostos { get; private set; }
    
    /// <summary>
    /// Margem de lucro da empresa sobre o contrato (percentual do valor total).
    /// Exemplo: 0.15 = 15% de lucro.
    /// </summary>
    public decimal MargemLucroPercentual { get; private set; }
    
    /// <summary>
    /// Margem de segurança para cobertura de faltas e imprevistos (percentual do valor total).
    /// Exemplo: 0.10 = 10% para cobrir custos com substituições.
    /// </summary>
    public decimal MargemCoberturaFaltasPercentual { get; private set; }
    
    /// <summary>
    /// Data de início de vigência do contrato.
    /// </summary>
    public DateOnly DataInicio { get; private set; }
    
    /// <summary>
    /// Data de término de vigência do contrato.
    /// </summary>
    public DateOnly DataFim { get; private set; }
    
    /// <summary>
    /// Status atual do contrato (ATIVO, PENDENTE, FINALIZADO).
    /// </summary>
    public StatusContrato Status { get; private set; }
    
    /// <summary>
    /// Quantidade total de funcionários vinculados a este contrato.
    /// Agora baseado na coleção de Funcionários.
    /// </summary>
    [NotMapped]
    public int QuantidadeFuncionarios => Math.Max(1, Funcionarios.Count);
    
    /// <summary>
    /// Quantidade ideal de funcionários por turno/posto.
    /// </summary>
    [NotMapped]
    public int QuantidadeIdealFuncionariosPorTurno
    {
        get
        {
            if (NumeroDePostos == 0)
                return 0;
            
            return QuantidadeFuncionarios / NumeroDePostos;
        }
    }

    public Cliente? Cliente { get; private set; }
    public ICollection<Funcionario> Funcionarios { get; private set; } = new List<Funcionario>(); // FASE 2: Navegação para funcionários
    public ICollection<Alocacao> Alocacoes { get; private set; } = new List<Alocacao>();

    protected Contrato() { }

    public Contrato(
        Guid empresaId,
        Guid clienteId,
        string descricao,
        decimal valorTotalMensal,
        decimal valorDiariaCobrada,
        decimal percentualAdicionalNoturno,
        decimal valorBeneficiosExtrasMensal,
        decimal percentualImpostos,
        int numeroDePostos, // Quantidade de turnos (2=12x36, 3=8h, 4=6h)
        decimal margemLucroPercentual,
        decimal margemCoberturaFaltasPercentual,
        DateOnly dataInicio,
        DateOnly dataFim,
        StatusContrato status,
        decimal? valorDiariaVigilante = null)
    {
        CheckRule(empresaId == Guid.Empty, "O contrato deve estar associado a uma empresa.");
        CheckRule(clienteId == Guid.Empty, "O contrato deve pertencer a um cliente.");
        CheckRule(string.IsNullOrWhiteSpace(descricao), "A descrição do contrato é obrigatória.");
        CheckRule(valorTotalMensal <= 0, "O valor total mensal deve ser maior que zero.");
        CheckRule(valorDiariaCobrada <= 0, "O valor da diária deve ser maior que zero.");
        CheckPercentual(percentualAdicionalNoturno, "Percentual de adicional noturno inválido.");
        CheckRule(valorBeneficiosExtrasMensal < 0, "Valor de benefícios não pode ser negativo.");
        CheckPercentual(percentualImpostos, "Percentual de impostos inválido.");
        CheckRule(numeroDePostos < 2 || numeroDePostos > 4, "Número de postos deve estar entre 2 e 4 (ex: 2=12x36, 3=8h, 4=6h).");
        CheckPercentual(margemLucroPercentual, "Margem de lucro inválida.");
        CheckPercentual(margemCoberturaFaltasPercentual, "Margem de faltas inválida.");
        CheckRule(dataFim <= dataInicio, "A data final deve ser posterior à data inicial.");
        CheckRule(
            percentualImpostos + margemLucroPercentual + margemCoberturaFaltasPercentual >= 1m,
            "A soma dos percentuais (impostos + lucro + faltas) não pode ser >= 100%.");
        CheckRule(!Enum.IsDefined(status), "Status do contrato é obrigatório.");

        EmpresaId = empresaId;
        ClienteId = clienteId;
        Descricao = descricao;
        ValorTotalMensal = valorTotalMensal;
        ValorDiariaCobrada = valorDiariaCobrada;
        ValorDiariaVigilante = valorDiariaVigilante;
        PercentualAdicionalNoturno = percentualAdicionalNoturno;
        ValorBeneficiosExtrasMensal = valorBeneficiosExtrasMensal;
        PercentualImpostos = percentualImpostos;
        NumeroDePostos = numeroDePostos;
        MargemLucroPercentual = margemLucroPercentual;
        MargemCoberturaFaltasPercentual = margemCoberturaFaltasPercentual;
        DataInicio = dataInicio;
        DataFim = dataFim;
        Status = status;
        ValorDiariaVigilante = valorDiariaVigilante;
    }

    public void AtualizarDados(
        string descricao,
        decimal valorTotalMensal,
        decimal valorDiariaCobrada,
        decimal percentualAdicionalNoturno,
        decimal valorBeneficiosExtrasMensal,
        decimal percentualImpostos,
        int numeroDePostos,
        decimal margemLucroPercentual,
        decimal margemCoberturaFaltasPercentual,
        DateOnly dataInicio,
        DateOnly dataFim,
        decimal? valorDiariaVigilante = null)
    {
        CheckRule(string.IsNullOrWhiteSpace(descricao), "A descrição do contrato é obrigatória.");
        CheckRule(valorTotalMensal <= 0, "O valor total mensal deve ser maior que zero.");
        CheckRule(valorDiariaCobrada <= 0, "O valor da diária deve ser maior que zero.");
        CheckPercentual(percentualAdicionalNoturno, "Percentual de adicional noturno inválido.");
        CheckRule(valorBeneficiosExtrasMensal < 0, "Valor de benefícios não pode ser negativo.");
        CheckPercentual(percentualImpostos, "Percentual de impostos inválido.");
        CheckRule(numeroDePostos < 2 || numeroDePostos > 4, "Número de postos deve estar entre 2 e 4.");
        CheckPercentual(margemLucroPercentual, "Margem de lucro inválida.");
        CheckPercentual(margemCoberturaFaltasPercentual, "Margem de faltas inválida.");
        CheckRule(dataFim <= dataInicio, "A data final deve ser posterior à data inicial.");
        CheckRule(
            percentualImpostos + margemLucroPercentual + margemCoberturaFaltasPercentual >= 1m,
            "A soma dos percentuais (impostos + lucro + faltas) não pode ser >= 100%.");

        Descricao = descricao;
        ValorTotalMensal = valorTotalMensal;
        ValorDiariaCobrada = valorDiariaCobrada;
        PercentualAdicionalNoturno = percentualAdicionalNoturno;
        ValorBeneficiosExtrasMensal = valorBeneficiosExtrasMensal;
        PercentualImpostos = percentualImpostos;
        NumeroDePostos = numeroDePostos;
        MargemLucroPercentual = margemLucroPercentual;
        MargemCoberturaFaltasPercentual = margemCoberturaFaltasPercentual;
        DataInicio = dataInicio;
        DataFim = dataFim;
        ValorDiariaVigilante = valorDiariaVigilante;
    }

    public void AtualizarStatus(StatusContrato status)
    {
        CheckRule(!Enum.IsDefined(status), "Status do contrato é obrigatório.");
        Status = status;
    }

    // FASE 3: Métodos de Cálculo Financeiro
    
    /// <summary>
    /// Calcula o salário base por funcionário (divisão igualitária)
    /// Fórmula: (ValorTotalMensal - Impostos - MargemLucro - MargemFaltas - Benefícios) / QuantidadeFuncionarios
    /// 
    /// CORREÇÃO CRÍTICA: Agora considera as margens de lucro e cobertura de faltas!
    /// 
    /// Exemplo:
    /// - ValorTotalMensal: R$ 36.000,00
    /// - Impostos (15%):   R$  5.400,00
    /// - Lucro (20%):      R$  7.200,00
    /// - Faltas (10%):     R$  3.600,00
    /// - Benefícios:       R$  3.600,00
    /// = Base Salários:    R$ 16.200,00
    /// / 12 funcionários = R$  1.350,00 cada
    /// </summary>
    public decimal CalcularSalarioBasePorFuncionario()
    {
        if (QuantidadeFuncionarios == 0)
            throw new InvalidOperationException("Contrato sem funcionários definidos.");
        
        // 1. Calcular deduções do valor total
        var valorImpostos = ValorTotalMensal * PercentualImpostos;
        var valorMargemLucro = ValorTotalMensal * MargemLucroPercentual;
        var valorMargemFaltas = ValorTotalMensal * MargemCoberturaFaltasPercentual;
        
        // 2. Base disponível para salários = Valor Total - Todas as deduções
        var baseParaSalarios = ValorTotalMensal 
            - valorImpostos 
            - valorMargemLucro 
            - valorMargemFaltas 
            - ValorBeneficiosExtrasMensal;
        
        // 3. Validar se base é positiva
        if (baseParaSalarios <= 0)
            throw new InvalidOperationException(
                $"Base para salários é negativa ou zero (R$ {baseParaSalarios:N2}). " +
                "Verifique os percentuais de impostos, margens e benefícios.");
        
        // 4. Dividir igualmente entre funcionários
        return Math.Round(baseParaSalarios / QuantidadeFuncionarios, 2);
    }
    
    /// <summary>
    /// Calcula adicional noturno baseado no salário base
    /// </summary>
    public decimal CalcularAdicionalNoturno(decimal salarioBase)
    {
        return Math.Round(salarioBase * PercentualAdicionalNoturno, 2);
    }
    
    /// <summary>
    /// Calcula benefícios por funcionário (divisão igualitária)
    /// </summary>
    public decimal CalcularBeneficiosPorFuncionario()
    {
        if (QuantidadeFuncionarios == 0)
            throw new InvalidOperationException("Contrato sem funcionários definidos.");
        
        return Math.Round(ValorBeneficiosExtrasMensal / QuantidadeFuncionarios, 2);
    }

    private static void CheckPercentual(decimal valor, string mensagem)
    {
        if (valor < 0m || valor > 1m)
        {
            throw new InvalidOperationException(mensagem);
        }
    }
}
