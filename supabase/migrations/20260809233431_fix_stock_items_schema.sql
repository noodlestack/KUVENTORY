-- Reload PostgREST schema cache to ensure frontend sees new columns
NOTIFY pgrst, 'reload schema';
