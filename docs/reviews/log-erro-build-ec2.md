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
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Executed DbCommand (4ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Failed executing DbCommand (5ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  | warn: Microsoft.AspNetCore.DataProtection.KeyManagement.XmlKeyManager[35]
interceptor_api  |       No XML encryptor configured. Key {b032df23-bf89-41ed-bdfb-9166650241c3} may be persisted to storage in unencrypted form.
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
interceptor_api  | info: Microsoft.Hosting.Lifetime[0]
interceptor_api  |       Application is shutting down...
interceptor_api  | warn: Microsoft.EntityFrameworkCore.Model.Validation[20606]
interceptor_api  |       The entity type 'Cliente.EmailGestor#Email' is an optional dependent using table sharing without any required non shared property that could be used to identify whether the entity exists. If all nullable properties contain a null value in database then an object instance won't be created in the query. Add a required property to create instances with null values for other properties or mark the incoming navigation as required to always create an instance.
interceptor_api  | warn: Microsoft.EntityFrameworkCore.Model.Validation[20606]
interceptor_api  |       The entity type 'Cliente.TelefoneEmergencia#Telefone' is an optional dependent using table sharing without any required non shared property that could be used to identify whether the entity exists. If all nullable properties contain a null value in database then an object instance won't be created in the query. Add a required property to create instances with null values for other properties or mark the incoming navigation as required to always create an instance.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (53ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT EXISTS (
interceptor_api  |           SELECT 1 FROM pg_catalog.pg_class c
interceptor_api  |           JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
interceptor_api  |           WHERE n.nspname='public' AND
interceptor_api  |                 c.relname='__EFMigrationsHistory'
interceptor_api  |       )
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Executed DbCommand (7ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Failed executing DbCommand (7ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Executed DbCommand (3ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Executed DbCommand (5ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  | info: Microsoft.Hosting.Lifetime[0]
interceptor_api  |       Application is shutting down...
interceptor_api  | warn: Microsoft.EntityFrameworkCore.Model.Validation[20606]
interceptor_api  |       The entity type 'Cliente.EmailGestor#Email' is an optional dependent using table sharing without any required non shared property that could be used to identify whether the entity exists. If all nullable properties contain a null value in database then an object instance won't be created in the query. Add a required property to create instances with null values for other properties or mark the incoming navigation as required to always create an instance.
interceptor_api  | warn: Microsoft.EntityFrameworkCore.Model.Validation[20606]
interceptor_api  |       The entity type 'Cliente.TelefoneEmergencia#Telefone' is an optional dependent using table sharing without any required non shared property that could be used to identify whether the entity exists. If all nullable properties contain a null value in database then an object instance won't be created in the query. Add a required property to create instances with null values for other properties or mark the incoming navigation as required to always create an instance.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (52ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT EXISTS (
interceptor_api  |           SELECT 1 FROM pg_catalog.pg_class c
interceptor_api  |           JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
interceptor_api  |           WHERE n.nspname='public' AND
interceptor_api  |                 c.relname='__EFMigrationsHistory'
interceptor_api  |       )
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (3ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Executed DbCommand (6ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Executed DbCommand (3ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Executed DbCommand (6ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Failed executing DbCommand (5ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  | info: Microsoft.Hosting.Lifetime[0]
interceptor_api  |       Application is shutting down...
interceptor_api  | warn: Microsoft.EntityFrameworkCore.Model.Validation[20606]
interceptor_api  |       The entity type 'Cliente.EmailGestor#Email' is an optional dependent using table sharing without any required non shared property that could be used to identify whether the entity exists. If all nullable properties contain a null value in database then an object instance won't be created in the query. Add a required property to create instances with null values for other properties or mark the incoming navigation as required to always create an instance.
interceptor_api  | warn: Microsoft.EntityFrameworkCore.Model.Validation[20606]
interceptor_api  |       The entity type 'Cliente.TelefoneEmergencia#Telefone' is an optional dependent using table sharing without any required non shared property that could be used to identify whether the entity exists. If all nullable properties contain a null value in database then an object instance won't be created in the query. Add a required property to create instances with null values for other properties or mark the incoming navigation as required to always create an instance.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (53ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT EXISTS (
interceptor_api  |           SELECT 1 FROM pg_catalog.pg_class c
interceptor_api  |           JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
interceptor_api  |           WHERE n.nspname='public' AND
interceptor_api  |                 c.relname='__EFMigrationsHistory'
interceptor_api  |       )
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (7ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Executed DbCommand (20ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  | info: Microsoft.Hosting.Lifetime[0]
interceptor_api  |       Application is shutting down...
interceptor_api  | warn: Microsoft.EntityFrameworkCore.Model.Validation[20606]
interceptor_api  |       The entity type 'Cliente.EmailGestor#Email' is an optional dependent using table sharing without any required non shared property that could be used to identify whether the entity exists. If all nullable properties contain a null value in database then an object instance won't be created in the query. Add a required property to create instances with null values for other properties or mark the incoming navigation as required to always create an instance.
interceptor_api  | warn: Microsoft.EntityFrameworkCore.Model.Validation[20606]
interceptor_api  |       The entity type 'Cliente.TelefoneEmergencia#Telefone' is an optional dependent using table sharing without any required non shared property that could be used to identify whether the entity exists. If all nullable properties contain a null value in database then an object instance won't be created in the query. Add a required property to create instances with null values for other properties or mark the incoming navigation as required to always create an instance.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (52ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT EXISTS (
interceptor_api  |           SELECT 1 FROM pg_catalog.pg_class c
interceptor_api  |           JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
interceptor_api  |           WHERE n.nspname='public' AND
interceptor_api  |                 c.relname='__EFMigrationsHistory'
interceptor_api  |       )
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  |       Executed DbCommand (5ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "__EFMigrationsHistory" (
interceptor_api  |           "MigrationId" character varying(150) NOT NULL,
interceptor_api  |           "ProductVersion" character varying(32) NOT NULL,
interceptor_api  |           CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT EXISTS (
interceptor_api  |           SELECT 1 FROM pg_catalog.pg_class c
interceptor_api  |           JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
interceptor_api  |           WHERE n.nspname='public' AND
interceptor_api  |                 c.relname='__EFMigrationsHistory'
interceptor_api  |       )
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT "MigrationId", "ProductVersion"
interceptor_api  |       FROM "__EFMigrationsHistory"
interceptor_api  |       ORDER BY "MigrationId";
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260309194444_Initial_Refactoring_Phase2'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (3ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
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
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "SessoesWhatsapp" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "Telefone" character varying(20) NOT NULL,
interceptor_api  |           "ContaId" uuid NOT NULL,
interceptor_api  |           "Estado" text NOT NULL,
interceptor_api  |           "ClienteIdSelecionado" uuid,
interceptor_api  |           "PostoIdSelecionado" uuid,
interceptor_api  |           "DataSelecionada" date,
interceptor_api  |           "DiariaIdParaSubstituir" uuid,
interceptor_api  |           "FuncionarioSubstitutoId" uuid,
interceptor_api  |           "OpcoesCacheJson" text,
interceptor_api  |           "CriadoEm" timestamp with time zone NOT NULL,
interceptor_api  |           "UltimaAtividade" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_SessoesWhatsapp" PRIMARY KEY ("Id")
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (5ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "Contratos" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "ClienteId" uuid NOT NULL,
interceptor_api  |           "Descricao" character varying(300) NOT NULL,
interceptor_api  |           "ValorTotalMensal" numeric(12,2) NOT NULL,
interceptor_api  |           "ValorDiariaCobrada" numeric(12,2) NOT NULL,
interceptor_api  |           "PercentualAdicionalNoturno" numeric(5,4) NOT NULL,
interceptor_api  |           "ValorBeneficiosExtrasMensal" numeric(12,2) NOT NULL,
interceptor_api  |           "PercentualImpostos" numeric(5,4) NOT NULL,
interceptor_api  |           "NumeroDePostos" integer NOT NULL,
interceptor_api  |           "MargemLucroPercentual" numeric(5,4) NOT NULL,
interceptor_api  |           "MargemCoberturaFaltasPercentual" numeric(5,4) NOT NULL,
interceptor_api  |           "DataInicio" date NOT NULL,
interceptor_api  |           "DataFim" date NOT NULL,
interceptor_api  |           "Status" character varying(50) NOT NULL,
interceptor_api  |           "EmpresaId" uuid NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_Contratos" PRIMARY KEY ("Id"),
interceptor_api  |           CONSTRAINT "FK_Contratos_Clientes_ClienteId" FOREIGN KEY ("ClienteId") REFERENCES "Clientes" ("Id") ON DELETE RESTRICT
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "TokensVerificacao" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "ContaId" uuid NOT NULL,
interceptor_api  |           "Token" character varying(512) NOT NULL,
interceptor_api  |           "Tipo" text NOT NULL,
interceptor_api  |           "ExpiresAt" timestamp with time zone NOT NULL,
interceptor_api  |           "Usado" boolean NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           "DadosAdicionais" character varying(1024),
interceptor_api  |           CONSTRAINT "PK_TokensVerificacao" PRIMARY KEY ("Id"),
interceptor_api  |           CONSTRAINT "FK_TokensVerificacao_Contas_ContaId" FOREIGN KEY ("ContaId") REFERENCES "Contas" ("Id") ON DELETE CASCADE
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "Funcionarios" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "ClienteId" uuid NOT NULL,
interceptor_api  |           "ContratoId" uuid NOT NULL,
interceptor_api  |           "Nome" character varying(250) NOT NULL,
interceptor_api  |           "Cpf" character varying(14) NOT NULL,
interceptor_api  |           "Celular" character varying(30) NOT NULL,
interceptor_api  |           "StatusFuncionario" character varying(50) NOT NULL,
interceptor_api  |           "TipoEscala" character varying(50) NOT NULL,
interceptor_api  |           "TipoFuncionario" character varying(50) NOT NULL,
interceptor_api  |           "EmpresaId" uuid NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_Funcionarios" PRIMARY KEY ("Id"),
interceptor_api  |           CONSTRAINT "FK_Funcionarios_Clientes_ClienteId" FOREIGN KEY ("ClienteId") REFERENCES "Clientes" ("Id") ON DELETE RESTRICT,
interceptor_api  |           CONSTRAINT "FK_Funcionarios_Contratos_ContratoId" FOREIGN KEY ("ContratoId") REFERENCES "Contratos" ("Id") ON DELETE RESTRICT
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "Postos" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "ClienteId" uuid NOT NULL,
interceptor_api  |           "Nome" character varying(150) NOT NULL,
interceptor_api  |           "Endereco" character varying(250) NOT NULL,
interceptor_api  |           "Cidade" character varying(100) NOT NULL,
interceptor_api  |           "Estado" character varying(2) NOT NULL,
interceptor_api  |           "Ativo" boolean NOT NULL,
interceptor_api  |           "ContratoId" uuid,
interceptor_api  |           "EmpresaId" uuid NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_Postos" PRIMARY KEY ("Id"),
interceptor_api  |           CONSTRAINT "FK_Postos_Clientes_ClienteId" FOREIGN KEY ("ClienteId") REFERENCES "Clientes" ("Id") ON DELETE CASCADE,
interceptor_api  |           CONSTRAINT "FK_Postos_Contratos_ContratoId" FOREIGN KEY ("ContratoId") REFERENCES "Contratos" ("Id")
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "Alocacoes" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "PostoId" uuid NOT NULL,
interceptor_api  |           "ContratoId" uuid NOT NULL,
interceptor_api  |           "HorarioInicio" interval NOT NULL,
interceptor_api  |           "HorarioFim" interval NOT NULL,
interceptor_api  |           "TipoEscala" text NOT NULL,
interceptor_api  |           "PermiteDobrarEscala" boolean NOT NULL,
interceptor_api  |           "EmpresaId" uuid NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_Alocacoes" PRIMARY KEY ("Id"),
interceptor_api  |           CONSTRAINT "FK_Alocacoes_Contratos_ContratoId" FOREIGN KEY ("ContratoId") REFERENCES "Contratos" ("Id") ON DELETE CASCADE,
interceptor_api  |           CONSTRAINT "FK_Alocacoes_Postos_PostoId" FOREIGN KEY ("PostoId") REFERENCES "Postos" ("Id") ON DELETE CASCADE
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "Diarias" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "FuncionarioId" uuid NOT NULL,
interceptor_api  |           "AlocacaoId" uuid NOT NULL,
interceptor_api  |           "Data" date NOT NULL,
interceptor_api  |           "ValorDiaria" numeric NOT NULL,
interceptor_api  |           "StatusDiaria" text NOT NULL,
interceptor_api  |           "TipoDiaria" text NOT NULL,
interceptor_api  |           "EmpresaId" uuid NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_Diarias" PRIMARY KEY ("Id"),
interceptor_api  |           CONSTRAINT "FK_Diarias_Alocacoes_AlocacaoId" FOREIGN KEY ("AlocacaoId") REFERENCES "Alocacoes" ("Id") ON DELETE CASCADE,
interceptor_api  |           CONSTRAINT "FK_Diarias_Funcionarios_FuncionarioId" FOREIGN KEY ("FuncionarioId") REFERENCES "Funcionarios" ("Id") ON DELETE RESTRICT
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Alocacoes_ContratoId" ON "Alocacoes" ("ContratoId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Alocacoes_PostoId" ON "Alocacoes" ("PostoId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Clientes_EmpresaId" ON "Clientes" ("EmpresaId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Clientes_Nome" ON "Clientes" ("Nome");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE UNIQUE INDEX "IX_Contas_Email" ON "Contas" ("Email");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE UNIQUE INDEX "IX_Contas_Telefone" ON "Contas" ("Telefone") WHERE "Telefone" IS NOT NULL;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Contratos_ClienteId_Status" ON "Contratos" ("ClienteId", "Status");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Contratos_EmpresaId" ON "Contratos" ("EmpresaId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Diarias_AlocacaoId" ON "Diarias" ("AlocacaoId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Diarias_FuncionarioId" ON "Diarias" ("FuncionarioId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Funcionarios_ClienteId" ON "Funcionarios" ("ClienteId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Funcionarios_ContratoId" ON "Funcionarios" ("ContratoId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE UNIQUE INDEX "IX_Funcionarios_Cpf" ON "Funcionarios" ("Cpf");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Funcionarios_EmpresaId" ON "Funcionarios" ("EmpresaId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Postos_ClienteId" ON "Postos" ("ClienteId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Postos_ContratoId" ON "Postos" ("ContratoId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE UNIQUE INDEX "IX_SessoesWhatsapp_Telefone" ON "SessoesWhatsapp" ("Telefone");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_TokensVerificacao_ContaId_Tipo_Usado" ON "TokensVerificacao" ("ContaId", "Tipo", "Usado");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE UNIQUE INDEX "IX_TokensVerificacao_Token" ON "TokensVerificacao" ("Token");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (3ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260309194444_Initial_Refactoring_Phase2', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260310135324_AddHorarioTrocaTurnoToCliente'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Postos" DROP CONSTRAINT "FK_Postos_Contratos_ContratoId";
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       DROP INDEX "IX_Postos_ContratoId";
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Postos" DROP COLUMN "ContratoId";
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Funcionarios" ALTER COLUMN "ClienteId" DROP NOT NULL;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Contratos" ADD "ValorDiariaVigilante" numeric;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Clientes" ADD "HorarioTrocaTurno" time without time zone NOT NULL DEFAULT TIME '06:00:00';
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Clientes" ADD "QuantidadeIdealPorTurno" integer NOT NULL DEFAULT 2;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260310135324_AddHorarioTrocaTurnoToCliente', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260310142701_AddCnpjToCliente'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Clientes" ADD "Cnpj" character varying(14) NOT NULL DEFAULT '';
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (8ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |
interceptor_api  |                       WITH duplicated AS (
interceptor_api  |                           SELECT
interceptor_api  |                               "Id",
interceptor_api  |                               ROW_NUMBER() OVER (
interceptor_api  |                                   PARTITION BY "EmpresaId", "Cnpj"
interceptor_api  |                                   ORDER BY "CreatedAt", "Id"
interceptor_api  |                               ) AS rn
interceptor_api  |                           FROM "Clientes"
interceptor_api  |                       )
interceptor_api  |                       UPDATE "Clientes" c
interceptor_api  |                       SET "Cnpj" = 'DUP' || SUBSTRING(MD5(c."Id"::text) FROM 1 FOR 11)
interceptor_api  |                       FROM duplicated d
interceptor_api  |                       WHERE c."Id" = d."Id"
interceptor_api  |                         AND d.rn > 1;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE UNIQUE INDEX "IX_Clientes_EmpresaId_Cnpj" ON "Clientes" ("EmpresaId", "Cnpj");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260310142701_AddCnpjToCliente', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260311235604_Phase4_ContratoTag'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (3ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "Tags" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "Nome" character varying(100) NOT NULL,
interceptor_api  |           "Descricao" character varying(500),
interceptor_api  |           "EmpresaId" uuid NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_Tags" PRIMARY KEY ("Id")
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "ContratoTags" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "ContratoId" uuid NOT NULL,
interceptor_api  |           "TagId" uuid NOT NULL,
interceptor_api  |           "ValorDiaria" numeric(12,2) NOT NULL,
interceptor_api  |           "EmpresaId" uuid NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_ContratoTags" PRIMARY KEY ("Id"),
interceptor_api  |           CONSTRAINT "FK_ContratoTags_Contratos_ContratoId" FOREIGN KEY ("ContratoId") REFERENCES "Contratos" ("Id") ON DELETE CASCADE,
interceptor_api  |           CONSTRAINT "FK_ContratoTags_Tags_TagId" FOREIGN KEY ("TagId") REFERENCES "Tags" ("Id") ON DELETE CASCADE
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "FuncionarioTags" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "FuncionarioId" uuid NOT NULL,
interceptor_api  |           "TagId" uuid NOT NULL,
interceptor_api  |           "EmpresaId" uuid NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_FuncionarioTags" PRIMARY KEY ("Id"),
interceptor_api  |           CONSTRAINT "FK_FuncionarioTags_Funcionarios_FuncionarioId" FOREIGN KEY ("FuncionarioId") REFERENCES "Funcionarios" ("Id") ON DELETE CASCADE,
interceptor_api  |           CONSTRAINT "FK_FuncionarioTags_Tags_TagId" FOREIGN KEY ("TagId") REFERENCES "Tags" ("Id") ON DELETE CASCADE
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE UNIQUE INDEX "IX_ContratoTags_ContratoId_TagId" ON "ContratoTags" ("ContratoId", "TagId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_ContratoTags_EmpresaId" ON "ContratoTags" ("EmpresaId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_ContratoTags_TagId" ON "ContratoTags" ("TagId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_FuncionarioTags_EmpresaId" ON "FuncionarioTags" ("EmpresaId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE UNIQUE INDEX "IX_FuncionarioTags_FuncionarioId_TagId" ON "FuncionarioTags" ("FuncionarioId", "TagId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_FuncionarioTags_TagId" ON "FuncionarioTags" ("TagId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE UNIQUE INDEX "IX_Tags_EmpresaId_Nome" ON "Tags" ("EmpresaId", "Nome");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260311235604_Phase4_ContratoTag', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260318010347_AddCepNumeroComplementoToPosto'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Postos" ADD "Cep" character varying(8) NOT NULL DEFAULT '';
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Postos" ADD "Complemento" character varying(120);
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Postos" ADD "Numero" character varying(20) NOT NULL DEFAULT '';
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260318010347_AddCepNumeroComplementoToPosto', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260318133254_AddPostoTags'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE TABLE "PostoTags" (
interceptor_api  |           "Id" uuid NOT NULL,
interceptor_api  |           "PostoId" uuid NOT NULL,
interceptor_api  |           "TagId" uuid NOT NULL,
interceptor_api  |           "EmpresaId" uuid NOT NULL,
interceptor_api  |           "CreatedAt" timestamp with time zone NOT NULL,
interceptor_api  |           CONSTRAINT "PK_PostoTags" PRIMARY KEY ("Id"),
interceptor_api  |           CONSTRAINT "FK_PostoTags_Postos_PostoId" FOREIGN KEY ("PostoId") REFERENCES "Postos" ("Id") ON DELETE CASCADE,
interceptor_api  |           CONSTRAINT "FK_PostoTags_Tags_TagId" FOREIGN KEY ("TagId") REFERENCES "Tags" ("Id") ON DELETE CASCADE
interceptor_api  |       );
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_PostoTags_EmpresaId" ON "PostoTags" ("EmpresaId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE UNIQUE INDEX "IX_PostoTags_PostoId_TagId" ON "PostoTags" ("PostoId", "TagId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_PostoTags_TagId" ON "PostoTags" ("TagId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260318133254_AddPostoTags', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260324133532_RenamePercentualImpostosToEncargosProvisoes'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Contratos" RENAME COLUMN "PercentualImpostos" TO "PercentualEncargosProvisoes";
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260324133532_RenamePercentualImpostosToEncargosProvisoes', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260326182009_AddValorToTag_RemovePostoTags'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (3ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Tags" ADD COLUMN IF NOT EXISTS "Valor" decimal(12,2) NOT NULL DEFAULT 0.0;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       DROP TABLE IF EXISTS "PostoTags";
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260326182009_AddValorToTag_RemovePostoTags', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260326194000_ModifyTags'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260326194000_ModifyTags', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260326194314_FixMissingTagValorColumn'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (3ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Tags" ADD COLUMN IF NOT EXISTS "Valor" decimal(12,2) NOT NULL DEFAULT 0.0;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       DROP TABLE IF EXISTS "PostoTags";
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260326194314_FixMissingTagValorColumn', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260327140817_AddTagIdToDiaria_ExposeValorDiaria'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Diarias" ADD "TagId" uuid;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Diarias_TagId" ON "Diarias" ("TagId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Diarias" ADD CONSTRAINT "FK_Diarias_Tags_TagId" FOREIGN KEY ("TagId") REFERENCES "Tags" ("Id") ON DELETE SET NULL;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260327140817_AddTagIdToDiaria_ExposeValorDiaria', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260327141126_AddTagIdInDiaria'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260327141126_AddTagIdInDiaria', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260330221204_AddPercentualAdicionalFimSemana'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Contratos" ADD "PercentualAdicionalFimSemana" numeric NOT NULL DEFAULT 0.0;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260330221204_AddPercentualAdicionalFimSemana', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260408090000_AddQuantidadeFuncionariosToAlocacao'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Alocacoes" ADD "QuantidadeFuncionarios" integer NOT NULL DEFAULT 1;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260408090000_AddQuantidadeFuncionariosToAlocacao', '8.0.8');
interceptor_api  | info: Microsoft.EntityFrameworkCore.Migrations[20402]
interceptor_api  |       Applying migration '20260430175013_AddContratoIdToPosto'.
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Postos" ADD "ContratoId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       CREATE INDEX "IX_Postos_ContratoId" ON "Postos" ("ContratoId");
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       ALTER TABLE "Postos" ADD CONSTRAINT "FK_Postos_Contratos_ContratoId" FOREIGN KEY ("ContratoId") REFERENCES "Contratos" ("Id") ON DELETE CASCADE;
interceptor_api  | info: Microsoft.EntityFrameworkCore.Database.Command[20101]
interceptor_api  |       Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
interceptor_api  |       VALUES ('20260430175013_AddContratoIdToPosto', '8.0.8');
interceptor_api  | warn: Microsoft.AspNetCore.DataProtection.Repositories.FileSystemXmlRepository[60]
interceptor_api  |       Storing keys in a directory '/root/.aspnet/DataProtection-Keys' that may not be persisted outside of the container. Protected data will be unavailable when container is destroyed. For more information go to https://aka.ms/aspnet/dataprotectionwarning
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
interceptor_api  |       Executed DbCommand (2ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
interceptor_api  |       SELECT "MigrationId", "ProductVersion"
interceptor_api  |       FROM "__EFMigrationsHistory"
interceptor_api  |       ORDER BY "MigrationId";
interceptor_api  | warn: Microsoft.AspNetCore.DataProtection.Repositories.FileSystemXmlRepository[60]
interceptor_api  |       Storing keys in a directory '/root/.aspnet/DataProtection-Keys' that may not be persisted outside of the container. Protected data will be unavailable when container is destroyed. For more information go to https://aka.ms/aspnet/dataprotectionwarning
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