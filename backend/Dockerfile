FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY PittaApp.sln ./
COPY PittaApp.Api/PittaApp.Api.csproj PittaApp.Api/
RUN dotnet restore PittaApp.Api/PittaApp.Api.csproj
COPY PittaApp.Api/ PittaApp.Api/
RUN dotnet publish PittaApp.Api/PittaApp.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "PittaApp.Api.dll"]
