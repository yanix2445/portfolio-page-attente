# Séquence Email Waitlist · Lancement Portfolio

> Architecture et gestion des emails pour les abonnés de la liste d'attente sur `https://www.yanis-harrat.com`.

---

## 1. Vue d'ensemble de la séquence

| Étape | Délai | Modèle Resend | Statut | Rôle |
| :--- | :---: | :--- | :---: | :--- |
| **Email 1** | Instantané (J0) | `portfolio-waitlist-confirmation` (`161b9f72-81a9-4582-97e4-6c17636e348d`) | ✅ En production | Accusé de réception & preuve d'inscription. |
| **Email 2** | J+7 à J+10 | `portfolio-waitlist-teaser` (`a3803c02-66ef-4234-9f02-41d1ed6e9697`) | ✅ Publié | Nurture : présentation des coulisses (lab Proxmox, réseau Cisco, AD). |
| **Email 3** | Jour J | `portfolio-launch-announcement` (`e05633b4-4c4d-45fc-a418-edb3f72d282a`) | ✅ Publié | Annonce officielle avec bouton CTA direct vers le portfolio final. |

---

## 2. Fichiers sources des templates

Les gabarits HTML et texte brut sont versionnés dans le dossier [`templates/`](file:///Users/yanis/Developer/portfolio-page-attente/templates) :
* **Email 2 (Coulisses)** :
  * HTML : [`templates/02-teaser.html`](file:///Users/yanis/Developer/portfolio-page-attente/templates/02-teaser.html)
  * Texte brut : [`templates/02-teaser.txt`](file:///Users/yanis/Developer/portfolio-page-attente/templates/02-teaser.txt)
* **Email 3 (Lancement officiel)** :
  * HTML : [`templates/03-launch.html`](file:///Users/yanis/Developer/portfolio-page-attente/templates/03-launch.html)
  * Texte brut : [`templates/03-launch.txt`](file:///Users/yanis/Developer/portfolio-page-attente/templates/03-launch.txt)

---

## 3. Comment envoyer l'Email 2 ou l'Email 3 aux inscrits

Tous les inscrits sont regroupés dans le segment Resend :
* **Segment ID** : `573be7ef-e507-4299-9de5-3ef2dc46917c` (*Lancement Portfolio*).

### Option A : Depuis le Dashboard Resend (Broadcast)
1. Aller dans **Broadcasts** ➔ **Create Broadcast**.
2. Choisir l'audience : **Segment `Lancement Portfolio`**.
3. Sélectionner **Template** ➔ Choisir `Portfolio · Coulisses & Projets en cours` ou `Portfolio · Lancement Officiel`.
4. Cliquer sur **Send**.

### Option B : En ligne de commande (CLI Resend)
```bash
# Exemple d'envoi du teaser à un contact de test :
resend emails send \
  --from "Yanis Harrat <contact@yanis-harrat.com>" \
  --to "yanis@yanis-harrat.com" \
  --template portfolio-waitlist-teaser
```

---

## 4. Conformité & Délivrabilité
* Chaque template inclut la variable `{{{unsubscribe_url}}}` reliée à l'endpoint de désinscription 1-clic RFC 8058 (`/api/unsubscribe`).
* Le domaine d'expédition `yanis-harrat.com` est protégé par SPF, DKIM et DMARC `p=reject`.
