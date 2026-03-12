using System.ComponentModel.DataAnnotations;

namespace Sewa.Backend.Models
{
    public class PlatformStats
    {
        [Key]
        public int Id { get; set; }
        public decimal TotalRaised { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal RemainingFund { get; set; }
        public decimal AnimalFund { get; set; }
        public decimal EducationFund { get; set; }
        public decimal MedicalFund { get; set; }
        public decimal OldAgeFund { get; set; }
        public decimal GeneralFund { get; set; }
        public string? UpiId { get; set; }
        public string? UpiQrImageUrl { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
