import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  return (
    <s-page heading="Womance Inventory">
      <s-section heading="Synchronisation de l’inventaire avec Google Merchant Center">
        <s-paragraph>
          Cette application synchronise les niveaux d’inventaire de votre
          boutique Shopify avec Google Merchant Center. La disponibilité
          affichée dans vos annonces Google Shopping reflète ainsi votre stock
          réel, ce qui protège vos ventes et votre budget publicitaire en
          évitant d’annoncer des produits en rupture de stock.
        </s-paragraph>
      </s-section>

      <s-section heading="Fonctionnement">
        <s-unordered-list>
          <s-list-item>
            L’application lit les produits, les variantes et les quantités en
            stock de chaque emplacement de la boutique.
          </s-list-item>
          <s-list-item>
            Les quantités sont transmises à Google Merchant Center pour mettre à
            jour la disponibilité de chaque produit.
          </s-list-item>
          <s-list-item>
            Aucune action n’est requise de votre part une fois l’application
            installée.
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Accès utilisés">
        <s-unordered-list>
          <s-list-item>Produits</s-list-item>
          <s-list-item>Inventaire</s-list-item>
          <s-list-item>Emplacements</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Besoin d’aide ?">
        <s-paragraph>
          Communiquez avec l’équipe Leonard pour toute question sur la
          synchronisation.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
