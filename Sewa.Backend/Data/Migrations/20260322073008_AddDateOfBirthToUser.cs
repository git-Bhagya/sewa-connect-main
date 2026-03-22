using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sewa.Backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDateOfBirthToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Donations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    OrganizationId = table.Column<int>(type: "int", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RazorpayOrderId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RazorpayPaymentId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RazorpaySignature = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Sector = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Donations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Donations_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "OrganizationId");
                    table.ForeignKey(
                        name: "FK_Donations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Favorites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    OrganizationId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Favorites_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "OrganizationId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Favorites_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 22, 7, 30, 6, 904, DateTimeKind.Utc).AddTicks(2768));

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 22, 7, 30, 6, 904, DateTimeKind.Utc).AddTicks(2776));

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 3, 22, 7, 30, 6, 904, DateTimeKind.Utc).AddTicks(2783));

            migrationBuilder.UpdateData(
                table: "PlatformStats",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 3, 22, 7, 30, 6, 902, DateTimeKind.Utc).AddTicks(4397));

            migrationBuilder.CreateIndex(
                name: "IX_Donations_OrganizationId",
                table: "Donations",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_UserId",
                table: "Donations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_OrganizationId",
                table: "Favorites",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_UserId",
                table: "Favorites",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Donations");

            migrationBuilder.DropTable(
                name: "Favorites");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 23, 17, 52, 40, 737, DateTimeKind.Utc).AddTicks(7529));

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 23, 17, 52, 40, 737, DateTimeKind.Utc).AddTicks(7532));

            migrationBuilder.UpdateData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 2, 23, 17, 52, 40, 737, DateTimeKind.Utc).AddTicks(7535));

            migrationBuilder.UpdateData(
                table: "PlatformStats",
                keyColumn: "Id",
                keyValue: 1,
                column: "LastUpdated",
                value: new DateTime(2026, 2, 23, 17, 52, 40, 736, DateTimeKind.Utc).AddTicks(7765));
        }
    }
}
