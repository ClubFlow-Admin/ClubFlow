type Option = { id: string; label: string };

function EntityGroup({ legend, name, options, selectedIds }: { legend: string; name: string; options: Option[]; selectedIds: Set<string> }) {
  return (
    <fieldset className="rounded-md border p-4">
      <legend className="px-2 text-sm font-black">{legend}</legend>
      {options.length ? (
        <div className="grid max-h-48 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name={name} value={option.id} defaultChecked={selectedIds.has(option.id)} />
              {option.label}
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">None active yet — add records under {legend} in the Intelligence Graph admin.</p>
      )}
    </fieldset>
  );
}

export function AdminEntityTagging({
  clubs,
  companies,
  people,
  selectedClubIds = [],
  selectedCompanyIds = [],
  selectedPersonIds = []
}: {
  clubs: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  people: { id: string; firstName: string; lastName: string }[];
  selectedClubIds?: string[];
  selectedCompanyIds?: string[];
  selectedPersonIds?: string[];
}) {
  return (
    <div className="grid gap-4">
      <EntityGroup legend="Clubs" name="clubIds" options={clubs.map((club) => ({ id: club.id, label: club.name }))} selectedIds={new Set(selectedClubIds)} />
      <EntityGroup legend="Companies" name="companyIds" options={companies.map((company) => ({ id: company.id, label: company.name }))} selectedIds={new Set(selectedCompanyIds)} />
      <EntityGroup legend="People" name="personIds" options={people.map((person) => ({ id: person.id, label: `${person.firstName} ${person.lastName}` }))} selectedIds={new Set(selectedPersonIds)} />
    </div>
  );
}
