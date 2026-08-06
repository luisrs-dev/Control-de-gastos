"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Power, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  createCostCenter,
  updateCostCenter,
  toggleCostCenterStatus,
} from "@/actions/admin.actions";
import type { CostCenter } from "@/types";

interface CostCentersClientProps {
  initialCostCenters: CostCenter[];
}

export function CostCentersClient({ initialCostCenters }: CostCentersClientProps) {
  const [costCenters, setCostCenters] = useState(initialCostCenters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setDialogOpen(true);
  };

  const openEdit = (cc: CostCenter) => {
    setEditingId(cc.id);
    setName(cc.name);
    setDescription(cc.description ?? "");
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    setLoading(true);

    let result;
    if (editingId) {
      result = await updateCostCenter(editingId, { name, description });
    } else {
      result = await createCostCenter(name, description);
    }

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(editingId ? "Centro actualizado" : "Centro creado");
    setDialogOpen(false);

    // Refresh list
    window.location.reload();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const result = await toggleCostCenterStatus(id, !isActive);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setCostCenters((prev) =>
      prev.map((cc) => (cc.id === id ? { ...cc, isActive: !isActive } : cc))
    );
    toast.success(isActive ? "Centro desactivado" : "Centro activado");
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Centros de Costo</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Administra los centros de costo disponibles
          </p>
        </div>
        <Button id="new-cost-center-btn" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Centro
        </Button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
        {costCenters.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <Building2 className="w-12 h-12 mx-auto opacity-20 mb-3" />
            <p>No hay centros de costo creados aún</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)]">Nombre</th>
                <th className="text-left px-5 py-3 font-semibold text-[var(--muted-foreground)] hidden md:table-cell">Descripción</th>
                <th className="text-center px-5 py-3 font-semibold text-[var(--muted-foreground)]">Estado</th>
                <th className="text-center px-5 py-3 font-semibold text-[var(--muted-foreground)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {costCenters.map((cc) => (
                <tr key={cc.id} className="hover:bg-[var(--accent)] transition-colors">
                  <td className="px-5 py-4 font-medium">{cc.name}</td>
                  <td className="px-5 py-4 text-[var(--muted-foreground)] hidden md:table-cell">
                    {cc.description ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge variant={cc.isActive ? "default" : "secondary"}>
                      {cc.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(cc)}
                        aria-label={`Editar ${cc.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(cc.id, cc.isActive)}
                        aria-label={cc.isActive ? `Desactivar ${cc.name}` : `Activar ${cc.name}`}
                        className={cc.isActive ? "text-orange-500 hover:text-orange-600" : "text-green-500 hover:text-green-600"}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-labelledby="cost-center-dialog-title">
          <DialogHeader>
            <DialogTitle id="cost-center-dialog-title">
              {editingId ? "Editar Centro de Costo" : "Nuevo Centro de Costo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cc-name">Nombre <span className="text-red-500">*</span></Label>
              <Input
                id="cc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Alameda Norte"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cc-description">Descripción</Label>
              <Input
                id="cc-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción opcional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              id="save-cost-center-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
