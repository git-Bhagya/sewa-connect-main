using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sewa.Backend.Models
{
    public class SewaGroup
    {
        [Key]
        public int GroupId { get; set; }

        [Required]
        [MaxLength(200)]
        public string GroupName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int MemberCount { get; set; } = 0;

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [MaxLength(256)]
        public string? ContactEmail { get; set; }

        public string? LogoUrl { get; set; }

        public bool IsApproved { get; set; } = false;

        public int? CreatedBy { get; set; }
        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
