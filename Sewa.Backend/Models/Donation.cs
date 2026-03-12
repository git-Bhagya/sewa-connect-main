using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sewa.Backend.Models
{
    public class Donation
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        public int? OrganizationId { get; set; }
        [ForeignKey("OrganizationId")]
        public virtual Organization? Organization { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(100)]
        public string Currency { get; set; } = "INR";

        [Required]
        [MaxLength(100)]
        public string RazorpayOrderId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? RazorpayPaymentId { get; set; }

        [MaxLength(100)]
        public string? RazorpaySignature { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Created"; // Created, Captured, Failed

        public string? Sector { get; set; } // General, Food, Medical, etc.

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
