CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  bucket text PRIMARY KEY,
  count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.api_rate_limits TO service_role;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(_bucket text, _limit integer, _window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count integer;
BEGIN
  INSERT INTO public.api_rate_limits (bucket, count, window_start)
  VALUES (_bucket, 1, now())
  ON CONFLICT (bucket) DO UPDATE
    SET count = CASE
          WHEN public.api_rate_limits.window_start < now() - make_interval(secs => _window_seconds) THEN 1
          ELSE public.api_rate_limits.count + 1
        END,
        window_start = CASE
          WHEN public.api_rate_limits.window_start < now() - make_interval(secs => _window_seconds) THEN now()
          ELSE public.api_rate_limits.window_start
        END
  RETURNING count INTO _count;

  RETURN _count <= _limit;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;