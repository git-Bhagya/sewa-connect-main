using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Sewa.Backend.Models
{
    public class OrganizationType
    {
        [Key]
        public int OrganizationTypeId { get; set; }

        [Required]
        [MaxLength(100)]
        public string TypeName { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }
        
        public virtual ICollection<Organization> Organizations { get; set; } = new List<Organization>();
    }

    public class Organization
    {
        [Key]
        public int OrganizationId { get; set; }

        [Required]
        [MaxLength(200)]
        public string OrganizationName { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Address { get; set; }
        
        [MaxLength(100)]
        public string? City { get; set; }
        
        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [MaxLength(256)]
        public string? ContactEmail { get; set; }

        public string? ImageUrl { get; set; }
        public string? PaymentQrImageUrl { get; set; }
        public string? UpiId { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsApproved { get; set; } = false;

        public int OrganizationTypeId { get; set; }
        [ForeignKey("OrganizationTypeId")]
        public virtual OrganizationType? OrganizationType { get; set; }

        public int? CreatedBy { get; set; }
        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<OrganizationImage> Images { get; set; } = new List<OrganizationImage>();
        public virtual ICollection<OrganizationRequirement> Requirements { get; set; } = new List<OrganizationRequirement>();
    }

    public class OrganizationImage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        public int OrganizationId { get; set; }
        [ForeignKey("OrganizationId")]
        [JsonIgnore]
        public virtual Organization? Organization { get; set; }
    }

    public class OrganizationRequirement
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = "Other"; // Food, Money, Clothes, Medical, Other

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int OrganizationId { get; set; }
        [ForeignKey("OrganizationId")]
        [JsonIgnore]
        public virtual Organization? Organization { get; set; }
    }
}
