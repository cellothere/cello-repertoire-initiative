import { useAuth } from '@/contexts/AuthContext';

/**
 * A thin strip under the navigation, shown only to super users, that switches between the regular view (what
 * visitors see) and admin view (edit buttons on pieces, resources and books).
 */
export default function AdminBar() {
  const { user, adminView, setAdminView } = useAuth();
  if (!user?.isSuperUser) return null;

  const option = (on: boolean, label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={adminView === on}
      onClick={() => setAdminView(on)}
      className={`rounded-full px-3 py-1 font-semibold transition-colors ${
        adminView === on ? 'bg-white text-gray-900 shadow-sm' : 'text-amber-900 hover:bg-amber-200/60'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`border-t text-xs ${adminView ? 'border-amber-300 bg-amber-100' : 'border-gray-200 bg-gray-50'}`}>
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-1">
        <span className="truncate text-amber-900">
          {adminView ? 'Admin view: edit buttons are on pieces, resources and books.' : 'You can edit the catalogue.'}
        </span>
        <div role="radiogroup" aria-label="View" className="flex shrink-0 rounded-full bg-amber-200/50 p-0.5">
          {option(false, 'Regular')}
          {option(true, 'Admin')}
        </div>
      </div>
    </div>
  );
}
