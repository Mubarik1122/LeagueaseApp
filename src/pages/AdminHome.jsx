import {
  AlertTriangle,
  Trophy,
  Users,
  Calendar,
  BarChart3,
  Plus,
  Activity,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import CompetitionTable from '../components/CompetitionTable';
import CreateDivisionModal from '../components/CreateDivisionModal';
import { useTournament } from '../hooks/useTournament';
import { useCompanyContext } from '../context/CompanyContext';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminHome() {
  const { tournaments, loading, error, fetchTournaments } = useTournament();
  const { isSuperAdmin, selectedCompanyId, companiesReady } = useCompanyContext();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const refreshTournaments = (force = false) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.userId) {
      fetchTournaments(user.userId, { force });
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.userId) return;
    if (isSuperAdmin && (!companiesReady || !selectedCompanyId)) return;
    refreshTournaments();
  }, [isSuperAdmin, selectedCompanyId, companiesReady]);

  const competitions = useMemo(() => {
    if (!Array.isArray(tournaments)) return [];

    return tournaments.map((tournament, index) => {
      const divisionOrTournamentId =
        tournament.divisionOrTournamentId ??
        tournament._id ??
        tournament.id ??
        `row-${index}`;

      return {
      id: divisionOrTournamentId,
      divisionOrTournamentId,
      name:
        tournament.tournamentName ||
        tournament.divisionOrtournamentName ||
        tournament.name ||
        'Unnamed',
      teams:
        tournament.teamCount ??
        tournament.teamsCount ??
        tournament.teams ??
        0,
      matches: tournament.matchCount ?? 0,
      results: tournament.resultCount ?? 0,
      conflicts: tournament.conflicts ?? 0,
      shortCode:
        tournament.shortCode != null
          ? String(tournament.shortCode).trim()
          : '—',
      type:
        tournament.tournamentType ||
        tournament.divisionOrTournamentType ||
        tournament.type ||
        'Division',
      season: tournament.season || 'N/A',
      status: tournament.status || 'Active',
    };
    });
  }, [tournaments]);

  const totalTeams = competitions.reduce(
    (sum, comp) => sum + (Number(comp.teams) || 0),
    0
  );

  const stats = [
    {
      label: 'Competitions',
      value: competitions.length,
      icon: Trophy,
      accent: 'from-[#003366] to-[#004080]',
      iconBg: 'bg-[#003366]/10',
      iconColor: 'text-[#003366]',
    },
    {
      label: 'Total Teams',
      value: totalTeams,
      icon: Users,
      accent: 'from-[#00ADE5] to-[#0088cc]',
      iconBg: 'bg-[#00ADE5]/10',
      iconColor: 'text-[#00ADE5]',
    },
    {
      label: 'Upcoming Matches',
      value: 0,
      icon: Calendar,
      accent: 'from-violet-500 to-violet-600',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Completed Results',
      value: 0,
      icon: BarChart3,
      accent: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  const quickActions = [
    {
      label: 'New Tournament',
      description: 'Create a division or league',
      icon: Plus,
      onClick: () => setShowCreateModal(true),
    },
    {
      label: 'Schedule Match',
      description: 'Plan upcoming fixtures',
      icon: Calendar,
      to: '/dashboard/schedule',
    },
    {
      label: 'Add Users',
      description: 'Players, officials & staff',
      icon: Users,
      to: '/dashboard/people',
    },
    {
      label: 'View Results',
      description: 'Scores and standings',
      icon: BarChart3,
      to: '/dashboard/results',
    },
  ];

  const showEmptyHint = !loading && !error && competitions.length === 0;
  const showTeamsHint =
    !loading && !error && competitions.length > 0 && totalTeams === 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Welcome — sticky below TopBar */}
      <div className="sticky top-16 z-20 -mx-4 bg-gray-50 px-4 pb-4 pt-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003366] via-[#003d7a] to-[#004080] p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#00ADE5]/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Leaguease Dashboard
              </div>
              <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
                Welcome Back
              </h1>
              <p className="max-w-xl text-sm text-blue-100 sm:text-base">
                Manage competitions, teams, schedules and results from one
                professional workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#003366] shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
            >
              <Plus size={20} />
              Create Tournament
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accent}`}
              />
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <span className="text-3xl font-bold tabular-nums text-gray-900">
                  {stat.value}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-white to-slate-50/80 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Activity className="h-5 w-5 text-[#00ADE5]" />
            Quick Actions
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Jump straight to common tasks
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const className =
              'group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#00ADE5]/50 hover:bg-[#00ADE5]/[0.03] hover:shadow-sm';

            const inner = (
              <>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00ADE5]/10 transition-colors group-hover:bg-[#00ADE5]">
                  <Icon className="h-5 w-5 text-[#00ADE5] transition-colors group-hover:text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 group-hover:text-[#003366]">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-[#00ADE5]" />
              </>
            );

            if (action.to) {
              return (
                <Link key={action.label} to={action.to} className={className}>
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={className}
              >
                {inner}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status alerts */}
      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/80 px-5 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00ADE5] border-t-transparent" />
          <p className="text-sm font-medium text-blue-800">
            Loading competitions…
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm font-medium text-red-700">
            Error loading competitions: {error}
          </p>
        </div>
      )}

      {showEmptyHint && (
        <div className="flex items-start gap-4 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-amber-900">Get started</p>
            <p className="mt-1 text-sm text-amber-800">
              No competitions found yet. Create your first tournament to begin.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#003366] to-[#004080] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <Plus size={16} />
              Create Your First Tournament
            </button>
          </div>
        </div>
      )}

      {showTeamsHint && (
        <div className="flex items-start gap-4 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-amber-900">Teams needed</p>
            <p className="mt-1 text-sm text-amber-800">
              Some competitions have no teams yet. Add teams to get started.
            </p>
            <Link
              to="/dashboard/teams"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0088cc] hover:underline"
            >
              Go to Team Management
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Competitions */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-white to-slate-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Trophy className="h-5 w-5 text-[#00ADE5]" />
              Your Competitions
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {competitions.length === 0
                ? 'All divisions and tournaments will appear here'
                : `${competitions.length} active competition${competitions.length === 1 ? '' : 's'}`}
            </p>
          </div>
          {!loading && competitions.length > 0 && (
            <span className="inline-flex w-fit items-center rounded-full bg-[#00ADE5]/10 px-3 py-1 text-xs font-semibold text-[#0088cc]">
              {totalTeams} team{totalTeams === 1 ? '' : 's'} total
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-14 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          ) : (
            <CompetitionTable competitions={competitions} />
          )}
        </div>
      </div>

      <CreateDivisionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => refreshTournaments(true)}
      />
    </div>
  );
}
