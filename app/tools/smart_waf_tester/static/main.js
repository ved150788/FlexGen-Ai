const checkbox = document.getElementById("legalCheckbox");
const submitBtn = document.getElementById("submitBtn");
const loader = document.getElementById("loader");
const resultBox = document.getElementById("resultContainer");

checkbox.addEventListener("change", () => {
	submitBtn.disabled = !checkbox.checked;
});

document.getElementById("scanForm").addEventListener("submit", async (e) => {
	e.preventDefault();
	resultBox.classList.add("hidden");
	loader.classList.remove("hidden");

	const rawTarget = document
		.getElementById("target")
		.value.trim()
		.replace(/^https?:\/\//, "");
	const target = "http://" + rawTarget;
	const method = document.getElementById("method").value;
	let headersInput = document.getElementById("headers").value;

	let headers = {};
	if (headersInput) {
		try {
			headers = JSON.parse(headersInput);
		} catch (err) {
			loader.classList.add("hidden");
			alert("❌ Invalid JSON in headers");
			return;
		}
	}

	try {
		const response = await fetch("/api/scan", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ target, method, headers }),
		});

		const result = await response.json();
		const results = result.scan.results;

		// Table
		let tableHTML = "";
		let successCount = 0;

		results.forEach((row) => {
			const isSuccess = row.analysis.includes("Bypass");
			if (isSuccess) successCount++;

			tableHTML += `
        <tr class="border-t">
          <td class="px-4 py-2">${row.payload}</td>
          <td class="px-4 py-2">${row.status_code}</td>
          <td class="px-4 py-2">${
						isSuccess
							? "✅ Bypass may be successful"
							: "❌ Likely blocked by WAF"
					}</td>
        </tr>
      `;
		});

		document.getElementById("summaryTableBody").innerHTML = tableHTML;

		const total = results.length;
		const percent = Math.round((successCount / total) * 100);
		document.getElementById("percentBox").innerText = `${percent}%`;

		document.getElementById("summaryText").innerHTML = `
      <p class="mb-1 font-semibold text-green-600">✅ ${successCount} payload(s) successfully bypassed the WAF protections.</p>
      <p class="mb-1 font-semibold text-red-600">❌ ${
				total - successCount
			} payload(s) were blocked (mostly XSS and JNDI attempts).</p>
      <p>⚠️ Indicates <strong>potential weaknesses</strong> in filtering path traversal and command injection patterns.</p>
    `;

		document.getElementById("jsonOutput").innerText = JSON.stringify(
			result,
			null,
			2
		);
		resultBox.classList.remove("hidden");
	} catch (err) {
		alert("Error during scan: " + err.message);
	} finally {
		loader.classList.add("hidden");
	}
});
