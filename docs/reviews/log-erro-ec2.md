cellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (4ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (2ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (3ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (6ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (2ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (2ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (2ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (3ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (2ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (2ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (1ms) [Parameters=[@__limite_0='?' (DbType = DateTime)], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT s."Id", s."ClienteIdSelecionado", s."ContaId", s."CriadoEm", s."DataSelecionada", s."DiariaIdParaSubstituir", s."Estado", s."FuncionarioSubstitutoId", s."OpcoesCacheJson", s."PostoIdSelecionado", s."Telefone", s."UltimaAtividade"
interceptor_api  |       FROM "SessoesWhatsapp" AS s
interceptor_api  |       WHERE s."UltimaAtividade" < @__limite_0
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Query[10100]
interceptor_api  |       An exception occurred while iterating over the results of a query for context type 'InterceptorSystem.Infrastructure.Persistence.Contexts.ApplicationDbContext'.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | fail: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       Erro ao limpar sessões WhatsApp expiradas.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42703: column s.ClienteIdSelecionado does not exist
interceptor_api  |
interceptor_api  |       POSITION: 16
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteReaderAsync(RelationalCommandParameterObject parameterObject, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.InitializeReaderAsync(AsyncEnumerator enumerator, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Storage.Internal.NpgsqlExecutionStrategy.ExecuteAsync[TState,TResult](TState state, Func`4 operation, Func`4 verifySucceeded, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 source, CancellationToken cancellationToken)
interceptor_api  |          at InterceptorSystem.Infrastructure.Persistence.Repositories.SessaoWhatsappRepository.GetExpiradas(Int32 timeoutMinutos) in /src/InterceptorSystem.Infrastructure/Persistence/Repositories/SessaoWhatsappRepository.cs:line 29
interceptor_api  |          at InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService.LimparSessoesExpiradasAsync(CancellationToken ct) in /src/InterceptorSystem.Infrastructure/Adapters/Whatsapp/BackgroundServices/SessaoExpiradaCleanupService.cs:line 44
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42703
interceptor_api  |           MessageText: column s.ClienteIdSelecionado does not exist
interceptor_api  |           Position: 16
interceptor_api  |           File: parse_relation.c
interceptor_api  |           Line: 3716
interceptor_api  |           Routine: errorMissingColumn
interceptor_api  | info: Microsoft.Hosting.Lifetime[0]
interceptor_api  |       Application is shutting down...
interceptor_api  | warn: Microsoft.EntityFrameworkCore.Model.Validation[20606]
interceptor_api  |       The entity type 'Cliente.EmailGestor#Email' is an optional dependent using table sharing without any required non shared property that could be used to identify whether the entity exists. If all nullable properties contain a null value in database then an object instance won't be created in the query. Add a required property to create instances with null values for other properties or mark the incoming navigation as required to always create an instance.
interceptor_api  | warn: Microsoft.EntityFrameworkCore.Model.Validation[20606]
interceptor_api  |       The entity type 'Cliente.TelefoneEmergencia#Telefone' is an optional dependent using table sharing without any required non shared property that could be used to identify whether the entity exists. If all nullable properties contain a null value in database then an object instance won't be created in the query. Add a required property to create instances with null values for other properties or mark the incoming navigation as required to always create an instance.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (51ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT EXISTS (
interceptor_api  |           SELECT 1 FROM pg_catalog.pg_class c
interceptor_api  |           JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
interceptor_api  |           WHERE n.nspname='public' AND
interceptor_api  |                 c.relname='__EFMigrationsHistory'
interceptor_api  |       )
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (4ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT "MigrationId", "ProductVersion"
interceptor_api  |       FROM "__EFMigrationsHistory"
interceptor_api  |       ORDER BY "MigrationId";
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT EXISTS (
interceptor_api  |           SELECT 1 FROM pg_catalog.pg_class c
interceptor_api  |           JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
interceptor_api  |           WHERE n.nspname='public' AND
interceptor_api  |                 c.relname='__EFMigrationsHistory'
interceptor_api  |       )
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT "MigrationId", "ProductVersion"
interceptor_api  |       FROM "__EFMigrationsHistory"
interceptor_api  |       ORDER BY "MigrationId";
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT EXISTS (
interceptor_api  |           SELECT 1 FROM pg_catalog.pg_class c
interceptor_api  |           JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
interceptor_api  |           WHERE n.nspname='public' AND
interceptor_api  |                 c.relname='__EFMigrationsHistory'
interceptor_api  |       )
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT EXISTS (
interceptor_api  |           SELECT 1 FROM pg_catalog.pg_class c
interceptor_api  |           JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
interceptor_api  |           WHERE n.nspname='public' AND
interceptor_api  |                 c.relname='__EFMigrationsHistory'
interceptor_api  |       )
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT "MigrationId", "ProductVersion"
interceptor_api  |       FROM "__EFMigrationsHistory"
interceptor_api  |       ORDER BY "MigrationId";
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260309194444_Initial_Refactoring_Phase2'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (11ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "Clientes" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "Nome" character varying(150) NOT NULL,
interceptor_api  |           "Cidade" character varying(100) NOT NULL,
interceptor_api  |           "Estado" character varying(2) NOT NULL,
interceptor_api  |           "Ativo" boolean NOT NULL,
interceptor_api  |           "EmailGestor" character varying(100),
interceptor_api  |           "TelefoneEmergencia" character varying(20),
interceptor_api  |           "EmpresaId" uuid NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_Clientes" PRIMARY KEY ("Id")
interceptor_api  |       );
interceptor_api  | fail: Microsoft.EntityFrameworkCore.Database.Command[20102]
interceptor_api  |       Failed executing DbCommand (6ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "Contas" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "Email" character varying(255) NOT NULL,
interceptor_api  |           "SenhaHash" character varying(255) NOT NULL,
interceptor_api  |           "NomeEmpresa" character varying(200) NOT NULL,
interceptor_api  |           "Cnpj" character varying(18),
interceptor_api  |           "Plano" text NOT NULL,
interceptor_api  |           "Ativo" boolean NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           "EmailVerificado" boolean NOT NULL,
interceptor_api  |           "EmailPendente" character varying(255),
interceptor_api  |           "Telefone" character varying(20),
interceptor_api  |           "TelefoneVerificado" boolean NOT NULL DEFAULT FALSE,
interceptor_api  |           CONSTRAINT "PK_Contas" PRIMARY KEY ("Id")
interceptor_api  |       );
interceptor_api  | fail: Program[0]
interceptor_api  |       Ocorreu um erro ao aplicar as migrações do banco de dados.
interceptor_api  |       Npgsql.PostgresException (0x80004005): 42P07: relation "Contas" already exists
interceptor_api  |          at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isReadingPrependedMessage)
interceptor_api  |          at System.Runtime.CompilerServices.PoolingAsyncValueTaskMethodBuilder`1.StateMachineBox`1.System.Threading.Tasks.Sources.IValueTaskSource<TResult>.GetResult(Int16 token)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isConsuming, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlDataReader.NextResult()
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteNonQuery(Boolean async, CancellationToken cancellationToken)
interceptor_api  |          at Npgsql.NpgsqlCommand.ExecuteNonQuery()
interceptor_api  |          at Microsoft.EntityFrameworkCore.Storage.RelationalCommand.ExecuteNonQuery(RelationalCommandParameterObject parameterObject)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Migrations.MigrationCommand.ExecuteNonQuery(IRelationalConnection connection, IReadOnlyDictionary`2 parameterValues)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Migrations.Internal.MigrationCommandExecutor.ExecuteNonQuery(IEnumerable`1 migrationCommands, IRelationalConnection connection)
interceptor_api  |          at Microsoft.EntityFrameworkCore.Migrations.Internal.Migrator.Migrate(String targetMigration)
interceptor_api  |          at Npgsql.EntityFrameworkCore.PostgreSQL.Migrations.Internal.NpgsqlMigrator.Migrate(String targetMigration)
interceptor_api  |          at Microsoft.EntityFrameworkCore.RelationalDatabaseFacadeExtensions.Migrate(DatabaseFacade databaseFacade)
interceptor_api  |          at Program.<Main>$(String[] args) in /src/InterceptorSystem.Api/Program.cs:line 135
interceptor_api  |         Exception data:
interceptor_api  |           Severity: ERROR
interceptor_api  |           SqlState: 42P07
interceptor_api  |           MessageText: relation "Contas" already exists
interceptor_api  |           File: heap.c
interceptor_api  |           Line: 1160
interceptor_api  |           Routine: heap_create_with_catalog
interceptor_api  | warn: Microsoft.AspNetCore.DataProtection.Repositories.FileSystemXmlRepository[60]
interceptor_api  |       Storing keys in a directory '/root/.aspnet/DataProtection-Keys' that may not be persisted outside of the container. Protected data will be unavailable when container is destroyed. For more information go to https://aka.ms/aspnet/dataprotectionwarning
interceptor_api  | info: InterceptorSystem.Infrastructure.Adapters.Whatsapp.BackgroundServices.SessaoExpiradaCleanupService[0]
interceptor_api  |       SessaoExpiradaCleanupService iniciado.
interceptor_api  | warn: Microsoft.AspNetCore.Hosting.Diagnostics[15]
interceptor_api  |       Overriding HTTP_PORTS '8080' and HTTPS_PORTS ''. Binding to values defined by URLS instead 'http://+:8080'.
interceptor_api  | info: Microsoft.Hosting.Lifetime[14]
interceptor_api  |       Now listening on: http://[::]:8080
interceptor_api  | info: Microsoft.Hosting.Lifetime[0]
interceptor_api  |       Application started. Press Ctrl+C to shut down.
interceptor_api  | info: Microsoft.Hosting.Lifetime[0]
interceptor_api  |       Hosting environment: Production
interceptor_api  | info: Microsoft.Hosting.Lifetime[0]
interceptor_api  |       Content root path: /app




