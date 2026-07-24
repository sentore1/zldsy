"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Plus, Trash2, DollarSign, 
  Users, Package, Truck, Calculator, TrendingUp, TrendingDown 
} from "lucide-react";

interface JobDetails {
  id: string;
  job_number: string;
  scheduled_date: string;
  status: string;
  booking: {
    customer: { name: string; phone: string };
    service: { name: string; base_price: number };
  };
  staff: Array<{
    id: string;
    staff_id: string;
    staff: { name: string; hourly_rate: number };
    hours_worked: number;
    labor_cost: number;
  }>;
  materials: Array<{
    id: string;
    inventory_id: string;
    inventory: { name: string; unit_cost: number; unit: string };
    quantity: number;
    cost: number;
  }>;
  equipment: Array<{
    id: string;
    equipment_id: string;
    equipment: { name: string; type: string };
    fuel_used: number;
    fuel_cost: number;
  }>;
}

interface Staff {
  id: string;
  name: string;
  hourly_rate: number;
  role: string;
}

interface Material {
  id: string;
  name: string;
  unit_cost: number;
  unit: string;
  quantity: number;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);

  // New staff assignment
  const [newStaff, setNewStaff] = useState({
    staff_id: "",
    hours_worked: 0,
  });

  // New material usage
  const [newMaterial, setNewMaterial] = useState({
    inventory_id: "",
    quantity: 0,
  });

  // New equipment usage
  const [newEquipment, setNewEquipment] = useState({
    equipment_id: "",
    fuel_used: 0,
    fuel_cost: 0,
  });

  useEffect(() => {
    fetchJobDetails();
    fetchAvailableResources();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      if (response.ok) {
        setJob(data.job);
      }
    } catch (err) {
      console.error("Failed to fetch job:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableResources = async () => {
    try {
      const [staffRes, inventoryRes, equipmentRes] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/inventory"),
        fetch("/api/equipment"),
      ]);

      const staffData = await staffRes.json();
      const inventoryData = await inventoryRes.json();
      const equipmentData = await equipmentRes.json();

      if (staffRes.ok) setAvailableStaff(staffData.staff || []);
      if (inventoryRes.ok) setAvailableMaterials(inventoryData.inventory || []);
      if (equipmentRes.ok) setAvailableEquipment(equipmentData.equipment || []);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.staff_id || newStaff.hours_worked <= 0) {
      alert("Please select staff and enter hours worked");
      return;
    }

    const selectedStaff = availableStaff.find(s => s.id === newStaff.staff_id);
    if (!selectedStaff) return;

    const labor_cost = selectedStaff.hourly_rate * newStaff.hours_worked;

    try {
      const response = await fetch(`/api/jobs/${jobId}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: newStaff.staff_id,
          hours_worked: newStaff.hours_worked,
          labor_cost,
        }),
      });

      if (response.ok) {
        await fetchJobDetails();
        setNewStaff({ staff_id: "", hours_worked: 0 });
        alert("Staff added successfully!");
      } else {
        alert("Failed to add staff");
      }
    } catch (err) {
      console.error("Failed to add staff:", err);
      alert("Failed to add staff");
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.inventory_id || newMaterial.quantity <= 0) {
      alert("Please select material and enter quantity");
      return;
    }

    const selectedMaterial = availableMaterials.find(m => m.id === newMaterial.inventory_id);
    if (!selectedMaterial) return;

    const cost = selectedMaterial.unit_cost * newMaterial.quantity;

    try {
      const response = await fetch(`/api/jobs/${jobId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventory_id: newMaterial.inventory_id,
          quantity: newMaterial.quantity,
          cost,
        }),
      });

      if (response.ok) {
        await fetchJobDetails();
        setNewMaterial({ inventory_id: "", quantity: 0 });
        alert("Material added successfully!");
      } else {
        alert("Failed to add material");
      }
    } catch (err) {
      console.error("Failed to add material:", err);
      alert("Failed to add material");
    }
  };

  const handleAddEquipment = async () => {
    if (!newEquipment.equipment_id) {
      alert("Please select equipment");
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEquipment),
      });

      if (response.ok) {
        await fetchJobDetails();
        setNewEquipment({ equipment_id: "", fuel_used: 0, fuel_cost: 0 });
        alert("Equipment added successfully!");
      } else {
        alert("Failed to add equipment");
      }
    } catch (err) {
      console.error("Failed to add equipment:", err);
      alert("Failed to add equipment");
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Remove this staff assignment?")) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}/staff/${staffId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchJobDetails();
        alert("Staff removed successfully!");
      }
    } catch (err) {
      console.error("Failed to delete staff:", err);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Remove this material?")) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}/materials/${materialId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchJobDetails();
        alert("Material removed successfully!");
      }
    } catch (err) {
      console.error("Failed to delete material:", err);
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!confirm("Remove this equipment?")) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}/equipment/${equipmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchJobDetails();
        alert("Equipment removed successfully!");
      }
    } catch (err) {
      console.error("Failed to delete equipment:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-12">Job not found</div>;
  }

  // Calculate costs
  const baseServiceCost = job.booking?.service?.base_price || 0;
  const totalLaborCost = job.staff?.reduce((sum, s) => sum + (s.labor_cost || 0), 0) || 0;
  const totalMaterialsCost = job.materials?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0;
  const totalEquipmentCost = job.equipment?.reduce((sum, e) => sum + (e.fuel_cost || 0), 0) || 0;
  const totalCosts = totalLaborCost + totalMaterialsCost + totalEquipmentCost;
  const grossProfit = baseServiceCost - totalCosts;
  const profitMargin = baseServiceCost > 0 ? (grossProfit / baseServiceCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{job.job_number}</h1>
          <p className="text-gray-600">
            {job.booking?.customer?.name} - {job.booking?.service?.name}
          </p>
        </div>
      </div>

      {/* Profit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-semibold">Service Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            RWF {baseServiceCost.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <Calculator className="w-5 h-5" />
            <h3 className="font-semibold">Total Costs</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            RWF {totalCosts.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Labor: {totalLaborCost.toFixed(2)} | Materials: {totalMaterialsCost.toFixed(2)} | Equipment: {totalEquipmentCost.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            {grossProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <h3 className="font-semibold">Gross Profit</h3>
          </div>
          <p className={`text-3xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            RWF {grossProfit.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-600 font-semibold mb-2">Profit Margin</h3>
          <p className={`text-3xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold">Staff Assigned</h2>
          </div>

          <div className="space-y-3 mb-4">
            {job.staff?.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{s.staff?.name}</p>
                  <p className="text-sm text-gray-600">
                    {s.hours_worked}h @ RWF {s.staff?.hourly_rate}/h
                  </p>
                </div>
                <div className="text-right mr-2">
                  <p className="font-bold text-indigo-600">
                    RWF {s.labor_cost?.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteStaff(s.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Add Staff</h3>
            <select
              value={newStaff.staff_id}
              onChange={(e) => setNewStaff({ ...newStaff, staff_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">Select Staff</option>
              {availableStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} - {staff.role} (RWF {staff.hourly_rate}/h)
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Hours worked"
              value={newStaff.hours_worked || ""}
              onChange={(e) => setNewStaff({ ...newStaff, hours_worked: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
            />
            <button
              onClick={handleAddStaff}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </button>
          </div>
        </div>

        {/* Materials Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold">Materials Used</h2>
          </div>

          <div className="space-y-3 mb-4">
            {job.materials?.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{m.inventory?.name}</p>
                  <p className="text-sm text-gray-600">
                    {m.quantity} {m.inventory?.unit} @ RWF {m.inventory?.unit_cost}/{m.inventory?.unit}
                  </p>
                </div>
                <div className="text-right mr-2">
                  <p className="font-bold text-green-600">
                    RWF {m.cost?.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMaterial(m.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Add Material</h3>
            <select
              value={newMaterial.inventory_id}
              onChange={(e) => setNewMaterial({ ...newMaterial, inventory_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select Material</option>
              {availableMaterials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name} (RWF {material.unit_cost}/{material.unit})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity used"
              value={newMaterial.quantity || ""}
              onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
            />
            <button
              onClick={handleAddMaterial}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Material
            </button>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold">Equipment Used</h2>
          </div>

          <div className="space-y-3 mb-4">
            {job.equipment?.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{e.equipment?.name}</p>
                  <p className="text-sm text-gray-600">
                    {e.equipment?.type} | Fuel: {e.fuel_used || 0}L
                  </p>
                </div>
                <div className="text-right mr-2">
                  <p className="font-bold text-purple-600">
                    RWF {e.fuel_cost?.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteEquipment(e.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Add Equipment</h3>
            <select
              value={newEquipment.equipment_id}
              onChange={(e) => setNewEquipment({ ...newEquipment, equipment_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            >
              <option value="">Select Equipment</option>
              {availableEquipment.map((equipment) => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name} ({equipment.type})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Fuel used (L)"
              value={newEquipment.fuel_used || ""}
              onChange={(e) => setNewEquipment({ ...newEquipment, fuel_used: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
            <input
              type="number"
              placeholder="Fuel cost (RWF)"
              value={newEquipment.fuel_cost || ""}
              onChange={(e) => setNewEquipment({ ...newEquipment, fuel_cost: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={handleAddEquipment}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
