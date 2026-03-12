using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sewa.Backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialFinalRebuild : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Users",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Roles",
                newName: "RoleName");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Roles",
                newName: "RoleId");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "OrganizationTypes",
                newName: "TypeName");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "OrganizationTypes",
                newName: "OrganizationTypeId");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Organizations",
                newName: "OrganizationName");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Organizations",
                newName: "OrganizationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Users",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "RoleName",
                table: "Roles",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "RoleId",
                table: "Roles",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "TypeName",
                table: "OrganizationTypes",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "OrganizationTypeId",
                table: "OrganizationTypes",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "OrganizationName",
                table: "Organizations",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "OrganizationId",
                table: "Organizations",
                newName: "Id");
        }
    }
}
