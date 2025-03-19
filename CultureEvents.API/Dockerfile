FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["CultureEvents.API.csproj", "./"]
RUN dotnet restore "CultureEvents.API.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "CultureEvents.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CultureEvents.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
RUN apt-get update && apt-get install -y curl
ENTRYPOINT ["dotnet", "CultureEvents.API.dll"]
