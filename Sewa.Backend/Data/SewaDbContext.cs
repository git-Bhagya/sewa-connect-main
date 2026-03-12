using Microsoft.EntityFrameworkCore;
using Sewa.Backend.Models;

namespace Sewa.Backend.Data
{
    public class SewaDbContext : DbContext
    {
        public SewaDbContext(DbContextOptions<SewaDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<UserPreference> UserPreferences { get; set; }
        public DbSet<OrganizationType> OrganizationTypes { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<OrganizationImage> OrganizationImages { get; set; }
        public DbSet<OrganizationRequirement> OrganizationRequirements { get; set; }
        public DbSet<Volunteer> Volunteers { get; set; }
        public DbSet<ContactInquiry> ContactInquiries { get; set; }
        public DbSet<SewaGroup> SewaGroups { get; set; }
        public DbSet<PlatformStats> PlatformStats { get; set; }
        public DbSet<Donation> Donations { get; set; }
        public DbSet<Favorite> Favorites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed Platform Stats
            modelBuilder.Entity<PlatformStats>().HasData(
                new PlatformStats { 
                    Id = 1, 
                    TotalRaised = 50000, 
                    TotalSpent = 35000, 
                    RemainingFund = 15000, 
                    UpiId = "sewa@upi",
                    LastUpdated = DateTime.UtcNow 
                }
            );

            // Configure UserRole Composite Key
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);

            // Configure Organization relationships
            modelBuilder.Entity<Organization>()
                .HasOne(o => o.Creator)
                .WithMany(u => u.CreatedOrganizations)
                .HasForeignKey(o => o.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { RoleId = 1, RoleName = "SuperAdmin" },
                new Role { RoleId = 2, RoleName = "Admin" },
                new Role { RoleId = 3, RoleName = "Donor" },
                new Role { RoleId = 4, RoleName = "User" },
                new Role { RoleId = 5, RoleName = "Volunteer" }
            );

            // Seed Organizations
            modelBuilder.Entity<Organization>().HasData(
                new Organization { 
                    OrganizationId = 1, 
                    OrganizationName = "Sewa Foundation", 
                    Description = "Helping the needy in Gujarat", 
                    City = "Ahmedabad", 
                    State = "Gujarat", 
                    OrganizationTypeId = 1, 
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow 
                },
                new Organization { 
                    OrganizationId = 2, 
                    OrganizationName = "Care for All", 
                    Description = "Animal care and rescue", 
                    City = "Unjha", 
                    State = "Gujarat", 
                    OrganizationTypeId = 4, 
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow 
                },
                new Organization { 
                    OrganizationId = 3, 
                    OrganizationName = "Uday Orphanage", 
                    Description = "Support for orphans", 
                    City = "Mehsana", 
                    State = "Gujarat", 
                    OrganizationTypeId = 3, 
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow 
                }
            );
            // Seed OrganizationTypes
            modelBuilder.Entity<OrganizationType>().HasData(
                new OrganizationType { OrganizationTypeId = 1, TypeName = "Gaushala" },
                new OrganizationType { OrganizationTypeId = 2, TypeName = "Vrudhashram" },
                new OrganizationType { OrganizationTypeId = 3, TypeName = "Orphanage" },
                new OrganizationType { OrganizationTypeId = 4, TypeName = "Animal Care" },
                new OrganizationType { OrganizationTypeId = 5, TypeName = "Education" },
                new OrganizationType { OrganizationTypeId = 6, TypeName = "Medical" },
                new OrganizationType { OrganizationTypeId = 7, TypeName = "Other" }
            );
        }
    }
}
