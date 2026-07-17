/*
# Revoke function grants

1. Security
- Revoke has_role() from PUBLIC and anon
- Revoke handle_new_user() from PUBLIC, anon, authenticated
*/

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
