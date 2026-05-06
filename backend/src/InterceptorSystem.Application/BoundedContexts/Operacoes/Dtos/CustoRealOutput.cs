using System;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Dtos
{
    public class CustoRealOutput
    {
        public decimal CustoTotalDiarias { get; set; }
        public decimal CustoTotalBeneficios { get; set; }
        public decimal CustoReal { get; set; }
        public decimal LucroReal { get; set; }
        public int QuantidadeFuncionarios { get; set; }
        public int QuantidadeDiarias { get; set; }
    }
}
