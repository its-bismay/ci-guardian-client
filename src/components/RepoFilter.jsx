export default function RepoFilter({ repos, selected, onChange }) {
  return (
    <select
      className="select select-bordered select-sm w-full max-w-xs"
      value={selected || ''}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">All Repos</option>
      {repos?.map((r) => (
        <option key={r.id} value={r.id}>{r.full_name}</option>
      ))}
    </select>
  );
}
