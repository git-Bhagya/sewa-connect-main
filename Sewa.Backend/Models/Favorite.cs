using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Sewa.Backend.Models
{
    public class Favorite
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [Required]
        public int OrganizationId { get; set; }
        [ForeignKey("OrganizationId")]
        public virtual Organization? Organization { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
