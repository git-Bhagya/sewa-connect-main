using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sewa.Backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCauseFunds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentQrImageUrl",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpiId",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ContactInquiries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhotoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactInquiries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlatformStats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TotalRaised = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalSpent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RemainingFund = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AnimalFund = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EducationFund = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MedicalFund = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OldAgeFund = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GeneralFund = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UpiId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpiQrImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformStats", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SewaGroups",
                columns: table => new
                {
                    GroupId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MemberCount = table.Column<int>(type: "int", nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SewaGroups", x => x.GroupId);
                    table.ForeignKey(
                        name: "FK_SewaGroups_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PaymentQrImageUrl", "UpiId" },
                values: new object[] { new DateTime(2026, 2, 23, 17, 52, 40, 737, DateTimeKind.Utc).AddTicks(7529), null, null });

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 2,
                columns: new[] { "CreatedAt", "PaymentQrImageUrl", "UpiId" },
                values: new object[] { new DateTime(2026, 2, 23, 17, 52, 40, 737, DateTimeKind.Utc).AddTicks(7532), null, null });

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 3,
                columns: new[] { "CreatedAt", "PaymentQrImageUrl", "UpiId" },
                values: new object[] { new DateTime(2026, 2, 23, 17, 52, 40, 737, DateTimeKind.Utc).AddTicks(7535), null, null });

            migrationBuilder.InsertData(
                table: "PlatformStats",
                columns: new[] { "Id", "AnimalFund", "EducationFund", "GeneralFund", "LastUpdated", "MedicalFund", "OldAgeFund", "RemainingFund", "TotalRaised", "TotalSpent", "UpiId", "UpiQrImageUrl" },
                values: new object[] { 1, 0m, 0m, 0m, new DateTime(2026, 2, 23, 17, 52, 40, 736, DateTimeKind.Utc).AddTicks(7765), 0m, 0m, 15000m, 50000m, 35000m, "sewa@upi", null });

            migrationBuilder.CreateIndex(
                name: "IX_SewaGroups_CreatedBy",
                table: "SewaGroups",
                column: "CreatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactInquiries");

            migrationBuilder.DropTable(
                name: "PlatformStats");

            migrationBuilder.DropTable(
                name: "SewaGroups");

            migrationBuilder.DropColumn(
                name: "PaymentQrImageUrl",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "UpiId",
                table: "Organizations");

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 6, 11, 22, 249, DateTimeKind.Utc).AddTicks(6237));

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 6, 11, 22, 249, DateTimeKind.Utc).AddTicks(6245));

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 6, 11, 22, 249, DateTimeKind.Utc).AddTicks(6252));
        }
    }
}
