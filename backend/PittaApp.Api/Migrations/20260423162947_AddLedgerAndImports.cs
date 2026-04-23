using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PittaApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLedgerAndImports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CsvImports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    UploadedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UploadedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MatchedCount = table.Column<int>(type: "integer", nullable: false),
                    SkippedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CsvImports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BankTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CsvImportId = table.Column<Guid>(type: "uuid", nullable: false),
                    MatchedUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CounterpartyIban = table.Column<string>(type: "text", nullable: false),
                    CounterpartyName = table.Column<string>(type: "text", nullable: false),
                    FreeMessage = table.Column<string>(type: "text", nullable: true),
                    AmountCents = table.Column<int>(type: "integer", nullable: false),
                    TransactionDate = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankTransactions_CsvImports_CsvImportId",
                        column: x => x.CsvImportId,
                        principalTable: "CsvImports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BankTransactions_Users_MatchedUserId",
                        column: x => x.MatchedUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "LedgerEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EntryType = table.Column<int>(type: "integer", nullable: false),
                    AmountCents = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    BankTransactionId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LedgerEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LedgerEntries_BankTransactions_BankTransactionId",
                        column: x => x.BankTransactionId,
                        principalTable: "BankTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LedgerEntries_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LedgerEntries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_CsvImportId",
                table: "BankTransactions",
                column: "CsvImportId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_MatchedUserId",
                table: "BankTransactions",
                column: "MatchedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CsvImports_FileName",
                table: "CsvImports",
                column: "FileName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LedgerEntries_BankTransactionId",
                table: "LedgerEntries",
                column: "BankTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_LedgerEntries_OrderId",
                table: "LedgerEntries",
                column: "OrderId",
                unique: true,
                filter: "\"OrderId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LedgerEntries_UserId",
                table: "LedgerEntries",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LedgerEntries");

            migrationBuilder.DropTable(
                name: "BankTransactions");

            migrationBuilder.DropTable(
                name: "CsvImports");
        }
    }
}
