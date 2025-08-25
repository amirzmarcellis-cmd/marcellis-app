import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityLogData {
  action_type: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata?: Record<string, any>;
}

export function useActivityLogger() {
  const logActivity = useCallback(async (data: ActivityLogData) => {
    try {
      // Disabled - activity_logs table doesn't exist in simplified structure
      console.log('Activity logged:', data);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, []);

  const logJobCreated = useCallback((jobId: string, jobTitle: string) => {
    logActivity({
      action_type: 'CREATE',
      entity_type: 'job',
      entity_id: jobId,
      description: `Created job: ${jobTitle}`,
      metadata: { job_title: jobTitle }
    });
  }, [logActivity]);

  const logJobUpdated = useCallback((jobId: string, jobTitle: string, changes: Record<string, any>) => {
    logActivity({
      action_type: 'UPDATE',
      entity_type: 'job',
      entity_id: jobId,
      description: `Updated job: ${jobTitle}`,
      metadata: { job_title: jobTitle, changes }
    });
  }, [logActivity]);

  const logJobStatusChanged = useCallback((jobId: string, jobTitle: string, oldStatus: string, newStatus: string) => {
    logActivity({
      action_type: 'STATUS_CHANGE',
      entity_type: 'job',
      entity_id: jobId,
      description: `Changed job status from ${oldStatus} to ${newStatus}: ${jobTitle}`,
      metadata: { job_title: jobTitle, old_status: oldStatus, new_status: newStatus }
    });
  }, [logActivity]);

  const logCandidateCreated = useCallback((candidateId: string, candidateName: string) => {
    logActivity({
      action_type: 'CREATE',
      entity_type: 'candidate',
      entity_id: candidateId,
      description: `Added candidate: ${candidateName}`,
      metadata: { candidate_name: candidateName }
    });
  }, [logActivity]);

  const logCandidateUpdated = useCallback((candidateId: string, candidateName: string, changes: Record<string, any>) => {
    logActivity({
      action_type: 'UPDATE',
      entity_type: 'candidate',
      entity_id: candidateId,
      description: `Updated candidate: ${candidateName}`,
      metadata: { candidate_name: candidateName, changes }
    });
  }, [logActivity]);

  const logCandidateStatusChanged = useCallback((candidateId: string, candidateName: string, oldStatus: string, newStatus: string) => {
    logActivity({
      action_type: 'STATUS_CHANGE',
      entity_type: 'candidate',
      entity_id: candidateId,
      description: `Changed candidate status from ${oldStatus} to ${newStatus}: ${candidateName}`,
      metadata: { candidate_name: candidateName, old_status: oldStatus, new_status: newStatus }
    });
  }, [logActivity]);

  const logCallCreated = useCallback((callId: string, candidateName: string, callType: string, status: string) => {
    logActivity({
      action_type: 'CREATE',
      entity_type: 'call',
      entity_id: callId,
      description: `Logged ${callType} call with ${candidateName} (${status})`,
      metadata: { candidate_name: candidateName, call_type: callType, call_status: status }
    });
  }, [logActivity]);

  const logFileUploaded = useCallback((entityType: string, entityId: string, fileName: string, fileType: string) => {
    logActivity({
      action_type: 'UPLOAD',
      entity_type: 'file',
      entity_id: `${entityType}_${entityId}`,
      description: `Uploaded file: ${fileName}`,
      metadata: { file_name: fileName, file_type: fileType, target_entity_type: entityType, target_entity_id: entityId }
    });
  }, [logActivity]);

  return {
    logActivity,
    logJobCreated,
    logJobUpdated,
    logJobStatusChanged,
    logCandidateCreated,
    logCandidateUpdated,
    logCandidateStatusChanged,
    logCallCreated,
    logFileUploaded
  };
}