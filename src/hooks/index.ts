import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsService, trainService, nodeService, deviceService, reportsService, analyticsService, dashboardService, incidentService } from "@/services";

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard"], queryFn: () => dashboardService.overview(), refetchInterval: 5000 });
}
export function useAlerts(params: Parameters<typeof alertsService.list>[0] = {}) {
  return useQuery({ queryKey: ["alerts", params], queryFn: () => alertsService.list(params), refetchInterval: 5000 });
}
export function useAlertsSummary() {
  return useQuery({ queryKey: ["alerts", "summary"], queryFn: () => alertsService.summary(), refetchInterval: 5000 });
}
export function useAlert(id: string | undefined) {
  return useQuery({ queryKey: ["alert", id], queryFn: () => alertsService.getById(id!), enabled: !!id });
}
export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsService.acknowledge(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
export function useEscalateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => alertsService.escalate(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
export function useExportAlert() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format?: "pdf" | "csv" }) => alertsService.exportAlert(id, format),
  });
}
export function useTrains(params: Parameters<typeof trainService.list>[0] = {}) {
  return useQuery({ queryKey: ["trains", params], queryFn: () => trainService.list(params), refetchInterval: 5000 });
}
export function useTrainsSummary() {
  return useQuery({ queryKey: ["trains", "summary"], queryFn: () => trainService.summary() });
}
export function useNodes() {
  return useQuery({ queryKey: ["nodes"], queryFn: () => nodeService.list(), refetchInterval: 5000 });
}
export function useNodesSummary() {
  return useQuery({ queryKey: ["nodes", "summary"], queryFn: () => nodeService.summary() });
}
export function useDevices(params: Parameters<typeof deviceService.list>[0] = {}) {
  return useQuery({ queryKey: ["devices", params], queryFn: () => deviceService.list(params) });
}
export function useReports(params: Parameters<typeof reportsService.list>[0] = {}) {
  return useQuery({ queryKey: ["reports", params], queryFn: () => reportsService.list(params) });
}
export function useReportsSummary() {
  return useQuery({ queryKey: ["reports", "summary"], queryFn: () => reportsService.summary() });
}
export function useAnalytics() {
  return useQuery({ queryKey: ["analytics"], queryFn: () => analyticsService.summary() });
}
export function useIncidents() {
  return useQuery({ queryKey: ["incidents"], queryFn: () => incidentService.list() });
}
