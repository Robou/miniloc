// Utilitaires de logging de sécurité (local uniquement)

export enum SecurityEventType {
  FAILED_LOGIN = 'failed_login',
  CSRF_VIOLATION = 'csrf_violation',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  XSS_ATTEMPT = 'xss_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
}

export interface SecurityLog {
  type: SecurityEventType;
  timestamp: number;
  message: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Logger de sécurité local
 */
class SecurityLogger {
  private logs: SecurityLog[] = [];
  private readonly maxLogs = 500;
  private readonly storageKey = 'security_logs';

  constructor() {
    // Charger les logs existants
    this.loadLogs();
  }

  /**
   * Enregistre un événement de sécurité
   */
  log(
    type: SecurityEventType,
    message: string,
    details: Record<string, any> = {},
    severity: SecurityLog['severity'] = 'medium'
  ): void {
    const log: SecurityLog = {
      type,
      timestamp: Date.now(),
      message,
      details,
      severity,
    };

    this.logs.push(log);

    // Limiter le nombre de logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Logger dans la console
    this.logToConsole(log);

    // Sauvegarder dans localStorage
    this.saveLogs();
  }

  /**
   * Log dans la console avec formatage
   */
  private logToConsole(log: SecurityLog): void {
    const prefix = `[SECURITY-${log.severity.toUpperCase()}]`;

    switch (log.severity) {
      case 'critical':
      case 'high':
        console.error(`${prefix} ${log.type}: ${log.message}`, log.details);
        break;
      case 'medium':
        console.warn(`${prefix} ${log.type}: ${log.message}`, log.details);
        break;
      case 'low':
        console.info(`${prefix} ${log.type}: ${log.message}`, log.details);
        break;
    }
  }

  /**
   * Sauvegarde les logs dans localStorage
   */
  private saveLogs(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Impossible de sauvegarder les logs de sécurité:', error);
    }
  }

  /**
   * Charge les logs depuis localStorage
   */
  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Impossible de charger les logs de sécurité:', error);
      this.logs = [];
    }
  }

  /**
   * Récupère tous les logs
   */
  getLogs(): SecurityLog[] {
    return [...this.logs];
  }

  /**
   * Récupère les logs récents (dernières 24h)
   */
  getRecentLogs(hours: number = 24): SecurityLog[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.logs.filter((log) => log.timestamp > cutoff);
  }

  /**
   * Récupère les logs par type
   */
  getLogsByType(type: SecurityEventType): SecurityLog[] {
    return this.logs.filter((log) => log.type === type);
  }

  /**
   * Compte les logs par sévérité
   */
  getLogCountsBySeverity(): Record<SecurityLog['severity'], number> {
    return this.logs.reduce(
      (counts, log) => {
        counts[log.severity] = (counts[log.severity] || 0) + 1;
        return counts;
      },
      {} as Record<SecurityLog['severity'], number>
    );
  }

  /**
   * Nettoie les logs anciens
   */
  cleanup(daysToKeep: number = 7): void {
    const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    this.logs = this.logs.filter((log) => log.timestamp > cutoff);
    this.saveLogs();
  }

  /**
   * Génère un résumé des logs
   */
  getSummary(): {
    totalLogs: number;
    logsByType: Record<SecurityEventType, number>;
    logsBySeverity: Record<SecurityLog['severity'], number>;
    recentLogs: SecurityLog[];
  } {
    const logsByType = this.logs.reduce(
      (counts, log) => {
        counts[log.type] = (counts[log.type] || 0) + 1;
        return counts;
      },
      {} as Record<SecurityEventType, number>
    );

    return {
      totalLogs: this.logs.length,
      logsByType,
      logsBySeverity: this.getLogCountsBySeverity(),
      recentLogs: this.getRecentLogs(24),
    };
  }

  /**
   * Exporte les logs au format JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instance globale du logger de sécurité
export const securityLogger = new SecurityLogger();

/**
 * Fonctions utilitaires pour logger des événements courants
 */
export const logSecurityEvent = {
  failedLogin: (email: string, reason: string) => {
    securityLogger.log(
      SecurityEventType.FAILED_LOGIN,
      `Tentative de connexion échouée pour ${email}`,
      { email, reason },
      'medium'
    );
  },

  csrfViolation: (details: Record<string, any>) => {
    securityLogger.log(
      SecurityEventType.CSRF_VIOLATION,
      'Violation de protection CSRF détectée',
      details,
      'high'
    );
  },

  rateLimitExceeded: (email: string, attempts: number) => {
    securityLogger.log(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      `Limite de tentatives dépassée pour ${email}`,
      { email, attempts },
      'high'
    );
  },

  xssAttempt: (input: string) => {
    securityLogger.log(
      SecurityEventType.XSS_ATTEMPT,
      "Tentative d'injection XSS détectée",
      { input: input.slice(0, 100) },
      'critical'
    );
  },
};
