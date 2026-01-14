using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Contrato : Entity, IAggregateRoot
{
    public Guid CondominioId { get; private set; }
    public string Descricao { get; private set; } = null!;
    public decimal ValorTotalMensal { get; private set; }
    public decimal ValorDiariaCobrada { get; private set; }
    public decimal PercentualAdicionalNoturno { get; private set; }
    public decimal ValorBeneficiosExtrasMensal { get; private set; }
    public decimal PercentualImpostos { get; private set; }
    public int QuantidadeFuncionarios { get; private set; }
    public decimal MargemLucroPercentual { get; private set; }
    public decimal MargemCoberturaFaltasPercentual { get; private set; }
    public DateOnly DataInicio { get; private set; }
    public DateOnly DataFim { get; private set; }
    public StatusContrato Status { get; private set; }

    public Condominio? Condominio { get; private set; }
    public ICollection<Funcionario> Funcionarios { get; private set; } = new List<Funcionario>(); // FASE 2: Navegação para funcionários

    protected Contrato() { }

    public Contrato(
        Guid empresaId,
        Guid condominioId,
        string descricao,
        decimal valorTotalMensal,
        decimal valorDiariaCobrada,
        decimal percentualAdicionalNoturno,
        decimal valorBeneficiosExtrasMensal,
        decimal percentualImpostos,
        int quantidadeFuncionarios,
        decimal margemLucroPercentual,
        decimal margemCoberturaFaltasPercentual,
        DateOnly dataInicio,
        DateOnly dataFim,
        StatusContrato status)
    {
        CheckRule(empresaId == Guid.Empty, "O contrato deve estar associado a uma empresa.");
        CheckRule(condominioId == Guid.Empty, "O contrato deve pertencer a um condomínio.");
        CheckRule(string.IsNullOrWhiteSpace(descricao), "A descrição do contrato é obrigatória.");
        CheckRule(valorTotalMensal <= 0, "O valor total mensal deve ser maior que zero.");
        CheckRule(valorDiariaCobrada <= 0, "O valor da diária deve ser maior que zero.");
        CheckPercentual(percentualAdicionalNoturno, "Percentual de adicional noturno inválido.");
        CheckRule(valorBeneficiosExtrasMensal < 0, "Valor de benefícios não pode ser negativo.");
        CheckPercentual(percentualImpostos, "Percentual de impostos inválido.");
        CheckRule(quantidadeFuncionarios <= 0, "Quantidade de funcionários deve ser maior que zero.");
        CheckPercentual(margemLucroPercentual, "Margem de lucro inválida.");
        CheckPercentual(margemCoberturaFaltasPercentual, "Margem de faltas inválida.");
        CheckRule(dataFim < dataInicio, "A data final deve ser maior ou igual à data inicial.");
        CheckRule(!Enum.IsDefined(status), "Status do contrato é obrigatório.");

        EmpresaId = empresaId;
        CondominioId = condominioId;
        Descricao = descricao;
        ValorTotalMensal = valorTotalMensal;
        ValorDiariaCobrada = valorDiariaCobrada;
        PercentualAdicionalNoturno = percentualAdicionalNoturno;
        ValorBeneficiosExtrasMensal = valorBeneficiosExtrasMensal;
        PercentualImpostos = percentualImpostos;
        QuantidadeFuncionarios = quantidadeFuncionarios;
        MargemLucroPercentual = margemLucroPercentual;
        MargemCoberturaFaltasPercentual = margemCoberturaFaltasPercentual;
        DataInicio = dataInicio;
        DataFim = dataFim;
        Status = status;
    }

    public void AtualizarDados(
        string descricao,
        decimal valorTotalMensal,
        decimal valorDiariaCobrada,
        decimal percentualAdicionalNoturno,
        decimal valorBeneficiosExtrasMensal,
        decimal percentualImpostos,
        int quantidadeFuncionarios,
        decimal margemLucroPercentual,
        decimal margemCoberturaFaltasPercentual,
        DateOnly dataInicio,
        DateOnly dataFim)
    {
        CheckRule(string.IsNullOrWhiteSpace(descricao), "A descrição do contrato é obrigatória.");
        CheckRule(valorTotalMensal <= 0, "O valor total mensal deve ser maior que zero.");
        CheckRule(valorDiariaCobrada <= 0, "O valor da diária deve ser maior que zero.");
        CheckPercentual(percentualAdicionalNoturno, "Percentual de adicional noturno inválido.");
        CheckRule(valorBeneficiosExtrasMensal < 0, "Valor de benefícios não pode ser negativo.");
        CheckPercentual(percentualImpostos, "Percentual de impostos inválido.");
        CheckRule(quantidadeFuncionarios <= 0, "Quantidade de funcionários deve ser maior que zero.");
        CheckPercentual(margemLucroPercentual, "Margem de lucro inválida.");
        CheckPercentual(margemCoberturaFaltasPercentual, "Margem de faltas inválida.");
        CheckRule(dataFim < dataInicio, "A data final deve ser maior ou igual à data inicial.");

        Descricao = descricao;
        ValorTotalMensal = valorTotalMensal;
        ValorDiariaCobrada = valorDiariaCobrada;
        PercentualAdicionalNoturno = percentualAdicionalNoturno;
        ValorBeneficiosExtrasMensal = valorBeneficiosExtrasMensal;
        PercentualImpostos = percentualImpostos;
        QuantidadeFuncionarios = quantidadeFuncionarios;
        MargemLucroPercentual = margemLucroPercentual;
        MargemCoberturaFaltasPercentual = margemCoberturaFaltasPercentual;
        DataInicio = dataInicio;
        DataFim = dataFim;
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
