# Build from repo root: docker build -f TelefonRehberApi/Dockerfile .
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TelefonRehberApi/TelefonRehberApi.csproj TelefonRehberApi/
RUN dotnet restore TelefonRehberApi/TelefonRehberApi.csproj

COPY TelefonRehberApi/ TelefonRehberApi/
WORKDIR /src/TelefonRehberApi
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TelefonRehberApi.dll"]
