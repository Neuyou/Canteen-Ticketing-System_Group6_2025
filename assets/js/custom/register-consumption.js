document.addEventListener('DOMContentLoaded', async () => {
    var workerSelect = document.getElementById('worker');
    var departmentSelect = document.getElementById('department');
    var workerSearch = document.getElementById('workerSearch');
    // const statusSelect = document.getElementById('status');
    var allWorkers = [];

    // Simple Levenshtein distance for fuzzy matching
    function editDistance(a, b) {
        if (!a) { return b ? b.length : 0; }
        if (!b) { return a ? a.length : 0; }
        a = String(a);
        b = String(b);
        var m = a.length;
        var n = b.length;
        var dp = new Array(n + 1);
        for (var j = 0; j <= n; j++) { dp[j] = j; }
        for (var i = 1; i <= m; i++) {
            var prev = dp[0];
            dp[0] = i;
            for (var j2 = 1; j2 <= n; j2++) {
                var temp = dp[j2];
                var cost = (a.charAt(i - 1) === b.charAt(j2 - 1)) ? 0 : 1;
                var del = dp[j2] + 1;          // deletion
                var ins = dp[j2 - 1] + 1;      // insertion
                var sub = prev + cost;         // substitution
                var val = del < ins ? del : ins;
                if (sub < val) { val = sub; }
                dp[j2] = val;
                prev = temp;
            }
        }
        return dp[n];
    }

    function isFuzzyMatch(nameLower, queryLower) {
        if (!queryLower || queryLower === '') { return true; }
        // direct contains
        if (nameLower.indexOf(queryLower) !== -1) { return true; }
        // distance threshold scales a bit with length
        var maxLen = nameLower.length > queryLower.length ? nameLower.length : queryLower.length;
        var dist = editDistance(nameLower, queryLower);
        var threshold = maxLen <= 5 ? 1 : (maxLen <= 10 ? 2 : 3);
        return dist <= threshold;
    }

    function rebuildWorkerOptions(filterDept, searchText) {
        // Clear existing options and restore placeholder
        workerSelect.innerHTML = '<option value="">Select Worker</option>';
        var nameNeedle = (searchText ? String(searchText).toLowerCase() : '');
        for (var i = 0; i < allWorkers.length; i++) {
            var w = allWorkers[i];
            var deptOk = (!filterDept || filterDept === '' || w.department === filterDept);
            var fullName = (w.firstName + ' ' + w.lastName).toLowerCase();
            var nameOk = (!nameNeedle || isFuzzyMatch(fullName, nameNeedle));
            if (deptOk && nameOk) {
                var opt = document.createElement('option');
                opt.value = w.id;
                opt.textContent = w.firstName + ' ' + w.lastName;
                workerSelect.appendChild(opt);
            }
        }
    }

    try {
        await openDatabase();
        allWorkers = await getAllData('workers');
        // Build initial list (no filters yet)
        rebuildWorkerOptions('', '');

        // Autofill from query parameters
        var params = new URLSearchParams(window.location.search);
        var qWorkerId = params.get('workerId');
        var qDepartment = params.get('department');
        var qStatus = params.get('status');

        if (qDepartment) {
            var deptEl = document.getElementById('department');
            if (deptEl) { deptEl.value = qDepartment; }
        }
        // After setting department from query, rebuild worker options with filter
        if (departmentSelect) {
            rebuildWorkerOptions(departmentSelect.value, workerSearch ? workerSearch.value : '');
        }
        if (qWorkerId) {
            // Ensure value types match (select values are strings) and set after filtering
            workerSelect.value = String(qWorkerId);
        }
        if (qStatus) {
            var statusEl = document.getElementById('status');
            if (statusEl) { statusEl.value = qStatus; }
        }
        
        
    } catch (error) {
        console.error('Failed to load workers:', error);
    }

    // When department changes, filter workers shown in the select
    if (departmentSelect) {
        departmentSelect.addEventListener('change', function() {
            rebuildWorkerOptions(departmentSelect.value, workerSearch ? workerSearch.value : '');
            // Reset selected worker when filter changes
            workerSelect.value = '';
        });
    }

    if (workerSearch) {
        workerSearch.addEventListener('input', function() {
            rebuildWorkerOptions(departmentSelect ? departmentSelect.value : '', workerSearch.value);
            // Do not force-reset selection unless current selection is hidden
            var current = workerSelect.value;
            if (current) {
                var exists = false;
                for (var i = 0; i < workerSelect.options.length; i++) {
                    if (workerSelect.options[i].value === current) { exists = true; break; }
                }
                if (!exists) { workerSelect.value = ''; }
            }
        });
    }
});

document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const workername = parseInt(document.getElementById('worker').value);
    const typeFood = document.getElementById('typeOfFood').value;
    const typeDrink = document.getElementById('typeOfDrink').value;
    const department = document.getElementById('department').value;
    const status = document.getElementById('status').value;
    const amountFood = parseInt(document.getElementById('amountFood').value);
    const amountDrink = parseInt(document.getElementById('amountDrink').value);
    const price = parseFloat(document.getElementById('price').value);
    const consumptiondate = document.getElementById('date').value;

    const newConsumption = {
        workername,
        typeFood,
        typeDrink,
        department,
        status,
        amountFood,
        amountDrink,
        price,
        consumptiondate
    };

    try {
        await addData('consumptions', newConsumption);
        alert('Consumption registered successfully!');
        event.target.reset();
    } catch (error) {
        alert('Failed to register consumption. Check the console for details.');
    }
});