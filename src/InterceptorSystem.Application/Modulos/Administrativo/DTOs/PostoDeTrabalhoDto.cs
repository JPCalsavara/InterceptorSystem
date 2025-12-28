namespace InterceptorSystem.Application.Modulos.Administrativo.DTOs;

// Entrada
public record CreatePostoInput(string Descricao, TimeSpan HorarioInicio, TimeSpan HorarioFim);

// Saída
public record PostoDeTrabalhoDto(Guid Id, string Descricao, string Horario); 
// Dica: Retornar string "08:00 - 20:00" facilita pro Front-end