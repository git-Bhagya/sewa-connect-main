using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Sewa.Backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class FinalSeedRebuild : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Organizations",
                columns: new[] { "OrganizationId", "Address", "City", "ContactEmail", "ContactPhone", "CreatedAt", "CreatedByUserId", "Description", "ImageUrl", "IsActive", "IsApproved", "OrganizationName", "OrganizationTypeId", "PaymentQrImageUrl", "State", "UpiId" },
                values: new object[,]
                {
                    { 1, null, "Ahmedabad", null, null, new DateTime(2026, 2, 22, 3, 9, 48, 135, DateTimeKind.Utc).AddTicks(8451), null, "Helping the needy in Gujarat", null, true, true, "Sewa Foundation", 1, null, "Gujarat", null },
                    { 2, null, "Unjha", null, null, new DateTime(2026, 2, 22, 3, 9, 48, 135, DateTimeKind.Utc).AddTicks(8455), null, "Animal care and rescue", null, true, true, "Care for All", 4, null, "Gujarat", null },
                    { 3, null, "Mehsana", null, null, new DateTime(2026, 2, 22, 3, 9, 48, 135, DateTimeKind.Utc).AddTicks(8457), null, "Support for orphans", null, true, true, "Uday Orphanage", 3, null, "Gujarat", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Organizations",
                keyColumn: "OrganizationId",
                keyValue: 3);
        }
    }
}
