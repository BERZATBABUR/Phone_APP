using TelefonRehberApi.Core;
using TelefonRehberApi.Models;

namespace TelefonRehberApi.Services;

/// <summary>
/// Service layer for contact business logic; uses Generic Repository.
/// </summary>
public class ContactService : IContactService
{
    private const int DefaultUserId = 1;

    private readonly IRepository<Contact> _repository;
    private readonly ILogger<ContactService> _logger;

    public ContactService(IRepository<Contact> repository, ILogger<ContactService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IEnumerable<Contact>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Contacts list requested");
        var list = await _repository.GetAllAsync(cancellationToken);
        var ordered = list.OrderBy(c => c.FirstName).ThenBy(c => c.LastName).ToList();
        _logger.LogInformation("Returning {Count} contacts", ordered.Count);
        return ordered;
    }

    public async Task<Contact?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _repository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Contact> CreateAsync(Contact contact, CancellationToken cancellationToken = default)
    {
        contact.UserId = DefaultUserId;
        contact.CreatedAt = DateTime.UtcNow;
        contact.UpdatedAt = null;
        var created = await _repository.AddAsync(contact, cancellationToken);
        _logger.LogInformation("Contact created: Id={Id}, Name={Name}", created.Id, $"{created.FirstName} {created.LastName}");
        return created;
    }

    public async Task UpdateAsync(int id, Contact contact, CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIdAsync(id, cancellationToken);
        if (existing == null)
        {
            _logger.LogWarning("Contact {Id} not found for update", id);
            throw new KeyNotFoundException($"Contact {id} not found.");
        }
        existing.FirstName = contact.FirstName;
        existing.LastName = contact.LastName;
        existing.PhoneNumber = contact.PhoneNumber;
        existing.Email = contact.Email;
        existing.Address = contact.Address;
        existing.Notes = contact.Notes;
        existing.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(existing, cancellationToken);
        _logger.LogInformation("Contact updated: Id={Id}, Name={Name}", id, $"{existing.FirstName} {existing.LastName}");
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var contact = await _repository.GetByIdAsync(id, cancellationToken);
        if (contact == null)
        {
            _logger.LogWarning("Contact {Id} not found for delete", id);
            return false;
        }
        var name = $"{contact.FirstName} {contact.LastName}";
        await _repository.DeleteAsync(contact, cancellationToken);
        _logger.LogInformation("Contact deleted: Id={Id}, Name={Name}", id, name);
        return true;
    }
}
