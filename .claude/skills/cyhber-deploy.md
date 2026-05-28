---
name: cyhber-deploy
description: Use when preparing staging/production deploys, modifying CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins), changing IaC (Terraform, Kubernetes, Docker), handling authentication/authorization/sessions/secrets, detecting injection vulnerabilities, reviewing security groups/IAM/RBAC, hardcoded credentials, exposed endpoints, or requesting security reviews
---

# Cyhber Deploy

## Overview

Systematic DevSecOps review methodology enforcing 5-layer analysis with standardized severity-tagged alerts.

**Purpose:** Ensure comprehensive, structured security review - not ad-hoc vulnerability detection.

## When to Use

**Trigger on:**
- Deploy preparation (staging/production)
- CI/CD changes (workflows, pipelines, build scripts)
- IaC modifications (Terraform, K8s, Docker, cloud config)
- Auth/authz/session handling code
- Secret management changes
- Security review requests
- Suspicious patterns (injection, exposed secrets, overprivileged access)

**Also trigger when user mentions:**
- GitHub Actions, GitLab CI, Jenkins, CircleCI
- AWS, GCP, Azure cloud resources
- Docker, Kubernetes, Helm
- SQL queries, database access
- API keys, tokens, certificates
- Environment variables, config files

## Systematic 5-Layer Review

**ALWAYS follow this order** - don't skip layers based on request scope:

1. **Code Validation** — Input validation, injection (SQL/XSS/Command), auth/authz, error handling
2. **Dependencies** — CVEs, outdated packages, unmaintained libraries, transitive dependencies
3. **Secrets & PII** — Hardcoded API keys, tokens, certificates, exposed personal data
4. **CI/CD Pipeline** — Branch restrictions, secret exposure, security gates, rollback plans
5. **Infrastructure** — Network exposure, IAM/RBAC permissions, encryption, security groups

## Context Gathering

Ask if missing:
- **Languages/frameworks:** Node.js, Python, Go, Java, etc.
- **App type:** API, frontend, microservices, monolith
- **Environments:** dev, staging, production
- **Deploy platform:** AWS, GCP, Azure, on-premise, Vercel, Railway
- **Related files:** CI/CD configs, IaC, environment configs

## Standardized Alert Format

**Every security issue MUST use this table:**

| Campo | Valor |
|-------|-------|
| **Severidad** | 🔴 CRITICO \| 🟠 ALTO \| 🟡 MEDIO \| 🟢 BAJO |
| **ID** | CD-SEC-XXX (sequential) |
| **Componente** | file.js:line or resource name |
| **Descripción** | What + why it's a risk |
| **Evidencia** | Code snippet or config excerpt |
| **Remediación** | Specific fix steps |

**Severity levels:**
- 🔴 **CRITICO:** Immediate exploitation possible (injection, hardcoded secrets, public DB)
- 🟠 **ALTO:** Exploitation likely with recon (weak auth, missing authz, exposed admin)
- 🟡 **MEDIO:** Requires chained exploits (verbose errors, missing headers, old deps)
- 🟢 **BAJO:** Defense-in-depth improvements (logging gaps, config hardening)

## Layer 1: Code Validation

### Input Validation
Check ALL user-controlled inputs:
- Type, size, format validation
- Whitelist over blacklist
- Reject vs sanitize (prefer reject)

### Injection Patterns
- Parameterized SQL queries
- Avoid eval() or shell execution of raw inputs
- Escaping HTML/JSON context-dependently

### Auth/Authz
- Endpoints require authentication?
- Authorization checks present (not just authn)?
- IDOR vulnerabilities (user A access user B data)?
- Session management secure (httpOnly, secure, sameSite)?

## Layer 2: Dependencies

**Check:**
- Outdated packages (>2 years old)
- Known CVEs (check npm audit, pip-audit, Snyk)
- Unmaintained libraries
- Transitive vulnerabilities

## Layer 3: Secrets & PII

**Scan for:**
- API keys, private keys, certificates, database credentials
- Cleartext credentials in config files
- PII (emails, phone numbers, addresses, names) in logs or databases

## Layer 4: CI/CD Pipeline

**Analyze:**
- Secret storage in pipelines (Github Secrets)
- Pull request code execution triggers
- Deployment workflows approval steps
- Rollback strategies

## Layer 5: Infrastructure

**Verify:**
- Container security (root execution, image scanning)
- Docker/Kubernetes configurations
- Network exposure (unnecessary open ports)
- IAM roles and database policies (like RLS in Supabase)
