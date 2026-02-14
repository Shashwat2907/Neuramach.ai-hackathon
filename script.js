



// Initialize the Supabase client
const _supabaseUrl = "https://hnvswmwfezkkzjhttxgs.supabase.co";
const _supabaseAnonKey = 'sb_publishable_gZWrsNqGTxBeY1wBH59RTw_nasYsHLg';
const supabase = supabase.createClient(_supabaseUrl, _supabaseAnonKey);

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

