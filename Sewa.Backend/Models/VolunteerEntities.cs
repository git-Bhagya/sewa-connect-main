using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sewa.Backend.Models
{
    public class Volunteer
    {
        [Key]
        public int VolunteerId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(12)] // Aadhaar is 12 digits
        public string AadharNumber { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Occupation { get; set; }

        public string? Skills { get; set; }

        [MaxLength(100)]
        public string? Availability { get; set; } // e.g. Weekends, Weekdays, Evenings

        public bool IsApproved { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Optional link to application user
        public int? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
