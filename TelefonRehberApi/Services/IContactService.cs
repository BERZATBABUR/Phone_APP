using TelefonRehberApi.Models;

namespace TelefonRehberApi.Services;

/// <summary>
/// Service layer interface for contact operations (layered architecture).
/// </summary>
public interface IContactService
{
    Task<IEnumerable<Contact>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Contact?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Contact> CreateAsync(Contact contact, CancellationToken cancellationToken = default);
    Task UpdateAsync(int id, Contact contact, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
