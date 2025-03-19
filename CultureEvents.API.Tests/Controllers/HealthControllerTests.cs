using CultureEvents.API.Controllers;
using CultureEvents.API.Configurations;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using Moq;
using FluentAssertions;
using MongoDB.Driver;
using System.Text.Json;

namespace CultureEvents.API.Tests.Controllers;

public class HealthControllerTests
{
    private readonly Mock<IOptions<MongoDbSettings>> _mockSettings;
    private readonly HealthController _controller;

    public HealthControllerTests()
    {
        _mockSettings = new Mock<IOptions<MongoDbSettings>>();
        _mockSettings.Setup(x => x.Value).Returns(new MongoDbSettings 
        { 
            ConnectionString = "mongodb://localhost:27017",
            DatabaseName = "TestDb"
        });
        _controller = new HealthController(_mockSettings.Object);
    }

    [Fact]
    public void Get_ReturnsOkResult()
    {
        // Act
        var result = _controller.Get();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var responseObj = JsonSerializer.Deserialize<JsonDocument>(
            JsonSerializer.Serialize(okResult.Value)
        ).RootElement;
        
        Assert.Equal("healthy", responseObj.GetProperty("status").GetString());
    }

    [Fact]
    public async Task GetStatus_ReturnsOkResult()
    {
        // Arrange
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");

        // Act
        var result = await _controller.GetStatus();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var responseObj = JsonSerializer.Deserialize<JsonDocument>(
            JsonSerializer.Serialize(okResult.Value)
        ).RootElement;

        Assert.Equal("Development", responseObj.GetProperty("environment").GetString());
        var database = responseObj.GetProperty("database");
        Assert.Equal("TestDb", database.GetProperty("name").GetString());
        Assert.Equal("connected", database.GetProperty("status").GetString());
    }
}
