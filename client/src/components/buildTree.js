export function buildTree(data) {
  console.log("Building tree from data:", data);

  if (!data || data.length === 0) {
    return {
      name: "No Data",
      attributes: {},
      children: [],
    };
  }

  // Helper function to normalize column names
  const normalizeKey = (key) => {
    return String(key)
      .toLowerCase()
      .replace(/[\s._-]/g, "")
      .trim();
  };

  // Helper function to get value by normalized key
  const getValueByNormalizedKey = (row, searchKeys) => {
    const normalizedRow = {};
    Object.keys(row).forEach((key) => {
      const normalizedKey = normalizeKey(key);
      normalizedRow[normalizedKey] = row[key];
    });

    for (const searchKey of searchKeys) {
      const normalizedSearchKey = normalizeKey(searchKey);
      if (
        normalizedRow[normalizedSearchKey] !== undefined &&
        normalizedRow[normalizedSearchKey] !== null &&
        normalizedRow[normalizedSearchKey] !== ""
      ) {
        return normalizedRow[normalizedSearchKey];
      }
    }
    return null;
  };

  const accountMap = {}; // Maps accountNo -> Array of Nodes
  const allNodes = []; // Linear list of all created nodes
  const layerMap = {}; // For stats only

  // First pass: Create nodes for EVERY row (no deduplication)
  data.forEach((row, index) => {
    const accountNo = getValueByNormalizedKey(row, [
      "Account No./ (Wallet /PG/PA) Id",
      "Account No",
      "AccountNo",
      "Account Number",
      "acc_no",
      "Acknowledgement N",
      "A/C No",
      "AC No",
    ]);

    const layer = getValueByNormalizedKey(row, ["Layer", "Level"]) || 0;

    if (!accountNo) {
      if (index < 3)
        console.warn(`Skipping row ${index}: No account number found`);
      return;
    }

    const nodeData = {
      // Use a unique internal ID if needed, but 'name' is what's displayed.
      name: String(accountNo),
      layer: Number(layer),
      id: `${String(accountNo)}-${index}`,
      attributes: {
        accountNo: accountNo,
        layer: layer,
        // ... (other attributes same as before)
        sNo: getValueByNormalizedKey(row, [
          "S.No",
          "SNo",
          "Serial No",
          "S No",
          "SerialNumber",
        ]),
        acknowledgementN: getValueByNormalizedKey(row, [
          "Acknowledgement N",
          "Acknowledgement",
          "AcknowledgementN",
          "Acknowledgement No",
        ]),
        ifscCode: getValueByNormalizedKey(row, [
          "IFSC Code",
          "IFSCCode",
          "IFSC",
          "Bank IFSC",
          "IFSC_Code",
        ]),
        state: getValueByNormalizedKey(row, ["State"]),
        district: getValueByNormalizedKey(row, ["District"]),
        policeStation: getValueByNormalizedKey(row, [
          "Police Station",
          "PS Name",
          "PoliceStation",
        ]),
        designation: getValueByNormalizedKey(row, ["Designation"]),
        mobileNumber: getValueByNormalizedKey(row, [
          "Mobile Number",
          "MobileNumber",
          "Mobile",
          "Phone",
        ]),
        email: getValueByNormalizedKey(row, ["Email", "E-mail", "EmailID"]),
        ...row,
      },
      children: [],
      hasParent: false,
    };

    allNodes.push(nodeData);

    // Add to map
    const accStr = String(accountNo);
    if (!accountMap[accStr]) {
      accountMap[accStr] = [];
    }
    accountMap[accStr].push(nodeData);

    // Stats
    const layerNum = Number(layer);
    if (!layerMap[layerNum]) {
      layerMap[layerNum] = [];
    }
    layerMap[layerNum].push(nodeData);
  });

  console.log("✅ Encapsulated Nodes Created:", allNodes.length);

  // Second pass: Build Relationships
  let relationshipsFound = 0;

  allNodes.forEach((node) => {
    // Try to find Parent (Sender)
    const parentAccNo = String(
      getValueByNormalizedKey(node.attributes, [
        "parent_acc_no",
        "ParentAccountNo",
        "Parent Account No",
        "Parent",
        "Sender Account",
        "Source Account",
        "Debit Account",
        "Remitter Account",
        "Sender",
        "Payer",
      ]) || ""
    );

    if (
      parentAccNo &&
      parentAccNo !== "null" &&
      parentAccNo !== "" &&
      accountMap[parentAccNo]
    ) {
      // Find suitable parents.
      // Rule: Parent should ideally be in (ChildLayer - 1).
      // If multiple parents exist in that layer, attach to ALL of them?
      // Or just first? Let's attach to ALL parents in the immediately preceding layer
      // to imply potential connections. If no parent in Layer-1, fall back to any parent.

      const potentialParents = accountMap[parentAccNo];

      // Filter for strict hierarchy first (Layer - 1)
      let validParents = potentialParents.filter(
        (p) => p.layer === node.layer - 1
      );

      // If no strict hierarchy parent found, fall back to ANY parent matching the account number.
      // This ensures that if the Excel says A -> B, we connect them regardless of layer logic.
      if (validParents.length === 0) {
        validParents = potentialParents;
      }

      // If still none, ignore (orphaned despite having parent name) OR attach to most recent?
      // Let's attach to all valid candidates found.
      if (validParents.length > 0) {
        validParents.forEach((parent) => {
          parent.children.push(node);
          node.hasParent = true;
          relationshipsFound++;
        });
      }
    }
  });

  console.log("✅ Parent-child relationships found:", relationshipsFound);

  // Roots: Nodes that have no parent
  let roots = allNodes.filter((n) => !n.hasParent);
  console.log("✅ Raw Roots found:", roots.length);

  // If no roots (circular?), force layer 0
  if (roots.length === 0 && allNodes.length > 0) {
    roots = allNodes.filter((n) => n.layer === 0);
    if (roots.length === 0) {
      // Absolute fallback
      roots = [allNodes[0]];
    }
  }

  const layers = Object.keys(layerMap)
    .map(Number)
    .sort((a, b) => a - b);

  const result = {
    name: "Transaction Flow",
    attributes: {
      totalAccounts: allNodes.length,
      totalLayers: layers.length,
    },
    children: roots,
  };

  console.log("🎉 Final tree built successfully!");
  console.log("   Total accounts:", result.attributes.totalAccounts);
  console.log("   Root nodes:", roots.length);

  return result;
}
