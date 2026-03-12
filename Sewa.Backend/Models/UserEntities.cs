using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sewa.Backend.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? FullName { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? LastLoginAt { get; set; }

        [MaxLength(10)]
        public string? OtpCode { get; set; }
        
        public DateTime? OtpExpiresAt { get; set; }

        // Navigation properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public virtual UserPreference? Preference { get; set; }
        public virtual ICollection<Organization> CreatedOrganizations { get; set; } = new List<Organization>();
    }

    public class UserPreference
    {
        [Key, ForeignKey("User")]
        public int UserId { get; set; }
        
        public virtual User User { get; set; } = null!;

        public bool NotifyFood { get; set; } = true;
        public bool NotifyMoney { get; set; } = true;
        public bool NotifyClothes { get; set; } = true;
        public bool NotifyMedical { get; set; } = true;
        public bool NotifyOthers { get; set; } = true;
    }

    public class Role
    {
        [Key]
        public int RoleId { get; set; }

        [Required]
        [MaxLength(50)]
        public string RoleName { get; set; } = string.Empty;

        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }

    public class UserRole
    {
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public int RoleId { get; set; }
        public virtual Role Role { get; set; } = null!;
    }
}
