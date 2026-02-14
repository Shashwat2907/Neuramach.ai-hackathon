



// Initialize the Supabase client
const _supabaseUrl = "https://hnvswmwfezkkzjhttxgs.supabase.co";
const _supabaseAnonKey = 'sb_publishable_gZWrsNqGTxBeY1wBH59RTw_nasYsHLg';
const supabase = supabase.createClient(_supabaseUrl, _supabaseAnonKey);
console.log("Supabase Connection Status:",supabase);
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Stop page from reloading

    const email = document.getElementById('emailInput').value;
    const btn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('loadingSpinner');

    // 1. Show Loading State
    btnText.style.display = 'none';
    spinner.classList.remove('hidden');
    btn.style.opacity = '0.7';
    btn.disabled = true;

    // 2. Simulate "Talking to Server" (Fake Delay)
    setTimeout(() => {
        // Success!
        alert("Welcome to the Vault, " + email);
        
        // Reset button
        btnText.style.display = 'block';
        spinner.classList.add('hidden');
        btn.style.opacity = '1';
        btn.disabled = false;
        
        // HERE IS WHERE WE WOULD GO TO THE DASHBOARD
         window.location.href = "dashboard.html";
        
    }, 1500); // 1.5 seconds delay
});

async function checkConnection() {
    try {
        // This is a simple call to the Supabase Auth API
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error("❌ Supabase connection error:", error.message);
            return;
        }

        console.log("✅ Supabase connected successfully!");
        console.log("Current Session Data:", data);
    } catch (err) {
        console.error("Internal Script Error:", err);
    }
}

// Run the check
checkConnection();
