<?php
/**
 * Plugin Name: Divi Manager Importer
 * Description: Importa shortcodes generados por Divi Manager como páginas en borrador.
 * Version: 0.1.0
 * Author: Uptobe
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_menu', function () {
    add_management_page(
        'Divi Manager Importer',
        'Divi Manager Importer',
        'manage_options',
        'divi-manager-importer',
        'divi_manager_importer_page'
    );
});

function divi_manager_importer_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $created = null;

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && check_admin_referer('divi_manager_import')) {
        $title = sanitize_text_field($_POST['divi_manager_title'] ?? 'Imported Divi Layout');
        $shortcodes = wp_kses_post(wp_unslash($_POST['divi_manager_shortcodes'] ?? ''));

        if (!empty($shortcodes)) {
            $post_id = wp_insert_post([
                'post_title' => $title,
                'post_content' => $shortcodes,
                'post_status' => 'draft',
                'post_type' => 'page',
            ]);

            if (!is_wp_error($post_id)) {
                update_post_meta($post_id, '_et_pb_use_builder', 'on');
                update_post_meta($post_id, '_et_pb_old_content', '');
                update_post_meta($post_id, '_et_pb_page_layout', 'et_full_width_page');
                $created = get_edit_post_link($post_id);
            }
        }
    }
    ?>
    <div class="wrap">
        <h1>Divi Manager Importer</h1>
        <?php if ($created): ?>
            <div class="notice notice-success"><p>Página creada en borrador. <a href="<?php echo esc_url($created); ?>">Editar página</a></p></div>
        <?php endif; ?>
        <form method="post">
            <?php wp_nonce_field('divi_manager_import'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="divi_manager_title">Título</label></th>
                    <td><input class="regular-text" id="divi_manager_title" name="divi_manager_title" value="Imported Divi Layout"></td>
                </tr>
                <tr>
                    <th><label for="divi_manager_shortcodes">Shortcodes Divi</label></th>
                    <td><textarea id="divi_manager_shortcodes" name="divi_manager_shortcodes" rows="18" class="large-text code"></textarea></td>
                </tr>
            </table>
            <?php submit_button('Crear página Divi en borrador'); ?>
        </form>
    </div>
    <?php
}
