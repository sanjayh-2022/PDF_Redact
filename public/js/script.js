// Function to set up UI interactions
function setupUIInteractions() {
    const switchMode = document.getElementById('switch-mode');

    // Apply the stored theme preference on page load
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', currentTheme === 'dark');
    switchMode.checked = currentTheme === 'dark';





    if (switchMode) {
        switchMode.addEventListener('change', function () {
            const isDarkMode = this.checked;
            document.body.classList.toggle('dark', isDarkMode);
            // Store the user's preference in localStorage
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
    }


    

    // Handle tab button clicks and update active state
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all tabs
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked tab
            button.classList.add('active');
        });
    });

    // Set the correct tab as active based on the current URL
    const currentPath = window.location.pathname;
    document.querySelectorAll('.tab-button').forEach(button => {
        const anchor = button.querySelector('a');
        if (anchor && anchor.getAttribute('href') === currentPath) {
            button.classList.add('active');
        } else {
            button.classList.remove('active'); // Ensure that non-matching tabs are not active
        }
    });
}

// Attach event listener to the file input
document.getElementById('uploadpdf').addEventListener('change', function() {
    const file = this.files[0]; // Get the selected file
    if (file) {
        // Display the file name in the span element
        document.getElementById('file-name').textContent = file.name;
    } else {
        // If no file is selected, clear the text
        document.getElementById('file-name').textContent = '';
    }
});


// Attach event listener to the file input
document.getElementById('uploadimage').addEventListener('change', function() {
    const file = this.files[0]; // Get the selected file
    if (file) {
        // Display the file name in the span element
        document.getElementById('image-name').textContent = file.name;
    } else {
        // If no file is selected, clear the text
        document.getElementById('image-name').textContent = '';
    }
});

 


// Event listener for DOMContentLoaded to initialize the UI interactions
document.addEventListener('DOMContentLoaded', setupUIInteractions);
