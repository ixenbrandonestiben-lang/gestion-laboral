export const SOURCES = Object.freeze({
    REFERRAL: 'REFERRAL',
    INTERNAL: 'INTERNAL',
    JOB_BOARD: 'JOB_BOARD',
    OTHER: 'OTHER',
  });
  
  export const APPLICATION_STATES = Object.freeze({
    RECEIVED: 'RECEIVED',
    IN_REVIEW: 'IN_REVIEW',
    REJECTED: 'REJECTED',
    HIRED: 'HIRED',
  });
  
  // Estados "activos": el candidato sigue en proceso
  export const ACTIVE_STATES = Object.freeze([
    APPLICATION_STATES.RECEIVED,
    APPLICATION_STATES.IN_REVIEW,
  ]);
  
  // Estados "finales": el proceso terminó
  export const FINAL_STATES = Object.freeze([
    APPLICATION_STATES.REJECTED,
    APPLICATION_STATES.HIRED,
  ]);
  
  export const VACANCY_STATES = Object.freeze({
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
  });
  
  export const PRIORITIES = Object.freeze({
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    TOP: 'TOP',
  });