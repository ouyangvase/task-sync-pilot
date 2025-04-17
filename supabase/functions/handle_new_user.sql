
-- Fix the handle_new_user function to properly cast the role and handle registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'employee'::user_role, -- Default to employee role with proper casting
    FALSE -- All new users start as unapproved
  );
  RETURN NEW;
END;
$function$;
