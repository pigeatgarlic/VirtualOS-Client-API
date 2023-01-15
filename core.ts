import  { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserProfile } from "./user/user.model";


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;


export class VirtualOSCore {
    supabase : SupabaseClient<any, "public", any>
    profile : UserProfile | null

    constructor() {
        if (supabaseUrl  == null || supabaseKey == null) {
            return
        }

        this.supabase = createClient(supabaseUrl,supabaseKey)
        this.profile = null;
    }


    private async fetchUserProfile() : Promise<UserProfile | null> {
        const user = await this.supabase.auth.getUser()
        if (user.error != null) {
            return null
        }

        const profile = await this.supabase.from("profile")
            .select("username, account_id")
            .eq("account_id",user.data.user?.id)

        if (profile.error != null) {
            return null
        }

        return {
            username : profile.data[0].account_id,
            email : user.data.user?.email
        };
    
    }

    public async SignInWithGoogle() : Promise<void>
    {
        const result = await this.supabase.auth.signInWithOAuth({provider : "google"});

        if(result.error != null) {
            return
        }

        let profile = await this.fetchUserProfile();
        if (profile == null) {
            return
        }

        this.profile =  profile;
    }

    public IsSignedIn() : boolean {
        return this.profile != null;
    }
}


const out = new VirtualOSCore();

export {out};