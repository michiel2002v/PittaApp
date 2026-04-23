using System.Net.Http.Json;

namespace PittaApp.Api.Services;

/// <summary>
/// Sends notifications to Microsoft Teams via an incoming webhook.
/// Configure "Teams:WebhookUrl" in appsettings or user-secrets.
/// If no URL is configured, notifications are silently skipped.
/// </summary>
public class TeamsNotificationService
{
    private readonly HttpClient _http;
    private readonly string? _webhookUrl;
    private readonly ILogger<TeamsNotificationService> _logger;

    public TeamsNotificationService(HttpClient http, IConfiguration config, ILogger<TeamsNotificationService> logger)
    {
        _http = http;
        _webhookUrl = config["Teams:WebhookUrl"];
        _logger = logger;
    }

    public async Task SendPittaArrivedAsync(DateOnly deliveryDate, int orderCount, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_webhookUrl))
        {
            _logger.LogWarning("Teams webhook URL not configured; skipping notification.");
            return;
        }

        var card = new
        {
            type = "message",
            attachments = new[]
            {
                new
                {
                    contentType = "application/vnd.microsoft.card.adaptive",
                    content = new
                    {
                        type = "AdaptiveCard",
                        version = "1.4",
                        body = new object[]
                        {
                            new { type = "TextBlock", size = "Large", weight = "Bolder", text = "🥙 Pitta is gearriveerd!" },
                            new { type = "TextBlock", text = $"De pitta-bestelling voor **{deliveryDate}** is er! ({orderCount} bestellingen)", wrap = true },
                            new { type = "TextBlock", text = "Smakelijk!", weight = "Bolder" },
                        },
                    },
                },
            },
        };

        try
        {
            var response = await _http.PostAsJsonAsync(_webhookUrl, card, ct);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Teams webhook returned {Status}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Teams notification");
        }
    }
}
