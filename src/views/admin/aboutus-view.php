<?php
/**
 * Summary aboutus-view.php
 *
 * File responsible for rendering about us view.
 *
 * @link http://athena.syncitgroup.com
 *
 * @package athena-search
 * @subpackage src/views/admin/
 * @author Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright Copyright (c) 2020, Syncit Group
 * @license http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
 * @since 1.0.0
 */

?>
<div class="about-syncit-options">
    <h1>Athena Search by Syncit Group</h1>
    <div class="wrapper-syncit-core-info">
        <a href="https://www.syncitgroup.com/?utm_source=admin&utm_medium=extensions&utm_campaign=magento"
           target="_blank" class="core-logo-link" title="Syncit Group WebSite">
            <img class="syncit-core-info-img"
                 src='<?php echo plugin_dir_url( "../" ) . "athena-search/public/img/SyncIt_full_logo.png" ?>'
                 alt="Syncit Group Logo">
        </a>
        <div class="syncit-core-info-links">
            <a class="syncit-core-facebook" href="https://www.facebook.com/syncitgroup/" target="_blank"
               title="Syncit Facebook"><i class="fab fa-facebook"></i></a>
            <a class="syncit-core-instagram" href="https://www.instagram.com/syncit_group/" target="_blank"
               title="Syncit Instagram"><i class="fab fa-instagram"></i></a>
            <a class="syncit-core-linkedin" href="https://www.linkedin.com/company/syncit-group" target="_blank"
               title="Syncit LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a class="syncit-core-mail" href="mailto:office%40%73%79nci%74gr%6Fup.c%6F%6D" title="Syncit Email"><i
                        class="fas fa-envelope"></i></a>
        </div>
    </div>
    <div class="syncit-core-info-desc">
        <p><?= /* @noEscape */ __("We are Syncit Group, a successful multinational IT company comprised of talented 
            individuals from all around the globe. Our goal has always been the pursuit of providing the best possible 
            business services to our customers by creating, developing, and maintaining high quality software solutions 
            that meet all our customers’ needs. We are in constant pursuit of improvement and therefore we are always 
            looking for new ways to improve. We value our clients highly, and we are fully committed to a win-win 
            philosophy built on trust. Our key success traits are adaptability, efficiency, inventiveness, tenacity 
            and technical achievement. We cooperate with companies from around the world including USA, Great Britain, 
            Serbia, Canada, India, and Germany.") ?></p>
    </div>
    <hr />
    <div class="syncit-products">
        <a class="syncit-prod-a" href="https://www.syncitgroup.com/?utm_source=admin&utm_medium=extensions&utm_campaign=wordpress" target="_blank" rel="noreferrer noopener" title="Syncit Website">
            <p>Syncit Website</p>
            <img class="syncit-img" src='<?php echo plugin_dir_url( "../" ) . "athena-search/public/img/syncit-website.jpg" ?>' alt=""/>
        </a>
        <a class="syncit-prod-a" href="https://www.athenasearch.io/?utm_source=admin&utm_medium=extensions&utm_campaign=wordpress" target="_blank" rel="noreferrer noopener" title="Athena Search Website">
            <p>Athena Search Website</p>
            <img class="syncit-img" src='<?php echo plugin_dir_url( "../" ) . "athena-search/public/img/athena-search.jpg" ?>' alt=""/>
        </a>
        <a class="syncit-prod-a" href="https://athena-demo.syncitgroup.com/?utm_source=admin&utm_medium=extensions&utm_campaign=wordpress" target="_blank" rel="noreferrer noopener" title="Athena Demo">
            <p>Athena Demo</p>
            <img class="syncit-img" src='<?php echo plugin_dir_url( "../" ) . "athena-search/public/img/athena-demo.jpg" ?>' alt=""/>
        </a>
        <a class="syncit-prod-a" href="https://www.iamherezone.com/?utm_source=admin&utm_medium=extensions&utm_campaign=wordpress" target="_blank" rel="noreferrer noopener" title="I am here zone APP">
            <p>I am here zone APP</p>
            <img class="syncit-img" src='<?php echo plugin_dir_url( "../" ) . "athena-search/public/img/im-here.jpg" ?>' alt=""/>
        </a>
        <a class="syncit-prod-a" href="https://extensions.syncitgroup.com/?utm_source=admin&utm_medium=extensions&utm_campaign=wordpress" target="_blank" rel="noreferrer noopener" title="Syncit Extensions">
            <p>Syncit Extensions</p>
            <img class="syncit-img" src='<?php echo plugin_dir_url( "../" ) . "athena-search/public/img/syncit-extensions.jpg" ?>' alt=""/>
        </a>
        <a class="syncit-prod-a" href="https://workzone.syncitgroup.com/?utm_source=admin&utm_medium=extensions&utm_campaign=wordpress" target="_blank" rel="noreferrer noopener" title="Syncit Workzone">
            <p>Syncit Workzone</p>
            <img class="syncit-img" src='<?php echo plugin_dir_url( "../" ) . "athena-search/public/img/workzone.jpg" ?>' alt=""/>
        </a>

    </div>

</div>