using System;
using System.ComponentModel.DataAnnotations;

namespace Sewa.Backend.Models
{
    public class ContactInquiry
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public string? PhotoUrl { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public bool IsCompleted { get; set; } = false;
    }
}
