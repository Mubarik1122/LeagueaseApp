import { supabase } from '../lib/supabase';

export const authAPI = {
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }
};

export const leagueAPI = {
  create: async (leagueData) => {
    const { data, error } = await supabase
      .from('leagues')
      .insert([leagueData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getById: async (leagueId) => {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (error) throw error;
    return data;
  },

  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  update: async (leagueId, updates) => {
    const { data, error } = await supabase
      .from('leagues')
      .update(updates)
      .eq('id', leagueId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (leagueId) => {
    const { error } = await supabase
      .from('leagues')
      .delete()
      .eq('id', leagueId);

    if (error) throw error;
  }
};

export const tournamentAPI = {
  save: async (tournamentData) => {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getById: async (tournamentId) => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (error) throw error;
    return data;
  },

  update: async (tournamentId, updates) => {
    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', tournamentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (tournamentId) => {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId);

    if (error) throw error;
  }
};

export const teamAPI = {
  save: async (teamData) => {
    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getByUserIdAndTournamentId: async (userId, tournamentId) => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('user_id', userId)
      .eq('tournament_id', tournamentId)
      .order('name');

    if (error) throw error;
    return data;
  },

  update: async (teamId, updates) => {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (teamId) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;
  }
};

export const playerAPI = {
  save: async (playerData) => {
    const { data, error } = await supabase
      .from('players')
      .insert([playerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getByUserIdAndTeam: async (userId, teamId) => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', userId)
      .eq('team_id', teamId)
      .order('name');

    if (error) throw error;
    return data;
  },

  update: async (playerId, updates) => {
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', playerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (playerId) => {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) throw error;
  }
};

export const matchAPI = {
  save: async (matchData) => {
    const { data, error } = await supabase
      .from('matches')
      .insert([matchData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getAllByUserId: async (userId, matchId = null) => {
    let query = supabase
      .from('matches')
      .select('*')
      .eq('user_id', userId)
      .order('match_date', { ascending: false });

    if (matchId) {
      query = query.eq('id', matchId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  update: async (matchId, updates) => {
    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (matchId) => {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) throw error;
  }
};

export const venueAPI = {
  save: async (venueData) => {
    const { data, error } = await supabase
      .from('venues')
      .insert([venueData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getDetails: async (userId, venueId = null) => {
    let query = supabase
      .from('venues')
      .select('*')
      .eq('user_id', userId);

    if (venueId) {
      query = query.eq('id', venueId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return venueId ? data[0] : data;
  },

  getNamesByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('venues')
      .select('id, name')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data;
  },

  update: async (venueId, updates) => {
    const { data, error } = await supabase
      .from('venues')
      .update(updates)
      .eq('id', venueId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (venueId) => {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', venueId);

    if (error) throw error;
  }
};
