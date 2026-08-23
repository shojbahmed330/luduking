---
name: game_rooms
description: Table for managing Ludu game rooms and multiplayer state.
type: feature
---

create table public.game_rooms (
    id uuid primary key default gen_random_uuid(),
    created_by uuid references auth.users(id),
    status text default 'waiting',
    current_turn_index int default 0,
    players_data jsonb default '[]'::jsonb,
    board_state jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now()
);

grant all on public.game_rooms to authenticated;
grant all on public.game_rooms to service_role;

alter table public.game_rooms enable row level security;

create policy "Users can view game rooms" on public.game_rooms for select to authenticated using (true);
create policy "Users can insert game rooms" on public.game_rooms for insert to authenticated with check (true);
create policy "Users can update game rooms" on public.game_rooms for update to authenticated using (true);
